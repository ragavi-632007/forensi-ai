import { supabase } from './supabaseClient';
import { CaseData, Officer, TeamMessage, ChatMessage, ActivityLog } from '../types';

// --- AUTHENTICATION ---
export const authenticateOfficer = async (badgeId: string, token: string): Promise<Officer | null> => {
  if (!supabase) {
    console.warn('Supabase not configured, authentication unavailable');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('officers')
      .select('*')
      .eq('badge_id', badgeId)
      .eq('secure_token', token)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 rows gracefully

    if (error) {
      console.error("Auth failed:", error);
      return null;
    }

    if (!data) {
      console.warn("No officer found with provided credentials");
      return null;
    }

    // Store authentication session in Supabase auth if needed
    // For now, we'll use the custom officers table approach
    
    const officer: Officer = {
      id: data.id,
      name: data.name,
      role: data.role,
      avatar: data.avatar || '',
      online: true
    };

    // Log successful authentication
    console.log(`Officer ${officer.name} authenticated successfully`);
    
    return officer;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
};

// --- CASE MANAGEMENT ---

// Save a full case (Bulk Insert) with Deduplication
export const persistCase = async (caseData: CaseData, officerId: string) => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping case persistence');
    return;
  }

  try {
    // 1. Insert Case Metadata (Upsert)
    const { error: caseError } = await supabase.from('cases').upsert({
      id: caseData.id,
      name: caseData.name,
      device: caseData.device,
      owner: caseData.owner,
      extraction_date: caseData.extractionDate,
      created_by: officerId
    }, {
      onConflict: 'id'
    });

    if (caseError) {
      console.error('Error saving case metadata:', caseError);
      throw caseError;
    }

    // 2. Clear existing evidence to prevent duplicates on re-upload
    // This ensures "Save All" is idempotent
    // Wait for all deletes to complete before proceeding
    const [deleteCalls, deleteMessages, deleteLocations, deleteMedia] = await Promise.all([
      supabase.from('evidence_calls').delete().eq('case_id', caseData.id),
      supabase.from('evidence_messages').delete().eq('case_id', caseData.id),
      supabase.from('evidence_locations').delete().eq('case_id', caseData.id),
      supabase.from('evidence_media').delete().eq('case_id', caseData.id)
    ]);

    // Check for delete errors
    if (deleteCalls.error) {
      console.warn('Warning: Error deleting calls:', deleteCalls.error);
    }
    if (deleteMessages.error) {
      console.warn('Warning: Error deleting messages:', deleteMessages.error);
    }
    if (deleteLocations.error) {
      console.warn('Warning: Error deleting locations:', deleteLocations.error);
    }
    if (deleteMedia.error) {
      console.warn('Warning: Error deleting media:', deleteMedia.error);
    }
    
    // Small delay to ensure deletes are committed
    await new Promise(resolve => setTimeout(resolve, 100));

    // 3. Insert Arrays (Evidence) with error handling
    // Use upsert to handle potential duplicates gracefully
    if (caseData.calls.length > 0) {
      const callsToInsert = caseData.calls.map(c => ({ 
        id: c.id || `${caseData.id}_call_${Date.now()}_${Math.random()}`, // Generate unique ID if missing
        case_id: caseData.id,
        timestamp: c.timestamp,
        from: c.from,
        to: c.to,
        duration: c.duration,
        type: c.type
      }));
      
      const { error: callsError } = await supabase.from('evidence_calls')
        .upsert(callsToInsert, { onConflict: 'id' });
      
      if (callsError) {
        console.error('Error saving calls:', callsError);
        throw callsError;
      }
    }

    if (caseData.messages.length > 0) {
      const messagesToInsert = caseData.messages.map(m => ({ 
        id: m.id || `${caseData.id}_msg_${Date.now()}_${Math.random()}`, // Generate unique ID if missing
        case_id: caseData.id,
        timestamp: m.timestamp,
        from: m.from,
        to: m.to,
        content: m.content,
        app: m.app
      }));
      
      const { error: messagesError } = await supabase.from('evidence_messages')
        .upsert(messagesToInsert, { onConflict: 'id' });
      
      if (messagesError) {
        console.error('Error saving messages:', messagesError);
        throw messagesError;
      }
    }

    if (caseData.locations.length > 0) {
      const locationsToInsert = caseData.locations.map(l => ({ 
        id: l.id || `${caseData.id}_loc_${Date.now()}_${Math.random()}`, // Generate unique ID if missing
        case_id: caseData.id,
        timestamp: l.timestamp,
        lat: l.lat,
        lng: l.lng,
        label: l.label
      }));
      
      const { error: locationsError } = await supabase.from('evidence_locations')
        .upsert(locationsToInsert, { onConflict: 'id' });
      
      if (locationsError) {
        console.error('Error saving locations:', locationsError);
        throw locationsError;
      }
    }

    if (caseData.media.length > 0) {
      // Process media files - try Storage upload but don't fail if it doesn't work
      const mediaWithUrls = await Promise.all(
        caseData.media.map(async (m) => {
          // If it's a blob URL, try to upload to Storage (optional)
          if (m.url && m.url.startsWith('blob:')) {
            try {
              // Get the blob from the media item if available
              const blob = (m as any)._blob;
              if (blob && supabase.storage) {
                // Check if Storage bucket exists by trying to list it first
                const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
                
                if (!bucketError && buckets?.some(b => b.id === 'evidence-media')) {
                  // Bucket exists, try to upload
                  const filePath = `${caseData.id}/${m.id}/${m.fileName}`;
                  const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('evidence-media')
                    .upload(filePath, blob, {
                      contentType: m.mimeType || 'application/octet-stream',
                      upsert: true
                    });

                  if (!uploadError && uploadData) {
                    // Get public URL
                    const { data: { publicUrl } } = supabase.storage
                      .from('evidence-media')
                      .getPublicUrl(filePath);

                    return {
                      id: m.id,
                      case_id: caseData.id,
                      timestamp: m.timestamp,
                      type: m.type,
                      file_name: m.fileName,
                      url: publicUrl,
                      size: m.size,
                      mime_type: m.mimeType,
                      metadata: m.metadata || {},
                      comments: Array.isArray(m.comments) ? m.comments : []
                    };
                  }
                }
                // Storage bucket doesn't exist or upload failed - continue without URL
                console.log(`Storage bucket 'evidence-media' not configured. Images will work in current session only.`);
              }
            } catch (error) {
              // Silently continue - Storage is optional
              console.log(`Storage upload skipped for ${m.fileName}. Images will work in current session.`);
            }
          }

          // If already a public URL, use it directly
          // For data URLs, limit size to prevent database errors
          let urlToStore = m.url;
          if (m.url && m.url.startsWith('data:')) {
            // Limit base64 data URLs to 500KB to prevent database errors
            if (m.url.length > 500000) {
              console.warn(`Data URL too large for ${m.fileName} (${(m.url.length/1024).toFixed(0)}KB), storing without URL`);
              urlToStore = null;
            }
          }

          // For blob URLs that couldn't be uploaded, store null
          // Images will work in current session but won't persist after reload
          if (m.url && m.url.startsWith('blob:')) {
            urlToStore = null;
          }

          return {
            id: m.id,
            case_id: caseData.id,
            timestamp: m.timestamp,
            type: m.type,
            file_name: m.fileName,
            url: urlToStore,
            size: m.size,
            mime_type: m.mimeType,
            metadata: m.metadata || {},
            comments: Array.isArray(m.comments) ? m.comments : []
          };
        })
      );

      // Use upsert for media as well to handle duplicates
      const { error: mediaError } = await supabase.from('evidence_media')
        .upsert(mediaWithUrls, { onConflict: 'id' });
      
      if (mediaError) {
        console.error('Error saving media:', mediaError);
        // Don't throw - allow case to save even if media fails
        console.warn('Case metadata saved, but some media items may have failed.');
      } else {
        console.log(`Successfully saved ${mediaWithUrls.length} media items`);
      }
    }

    console.log(`Successfully persisted case ${caseData.id} to Supabase`);
  } catch (error) {
    console.error('Failed to persist case:', error);
    throw error;
  }
};

// Load a full case by ID
export const fetchFullCase = async (caseId: string): Promise<CaseData | null> => {
  if (!supabase) return null;

  try {
    // Fetch Metadata
    const { data: c, error } = await supabase.from('cases').select('*').eq('id', caseId).single();
    if (error || !c) {
      console.error('Error fetching case metadata:', error);
      return null;
    }

    // Parallel fetch for evidence with proper error handling
    const [callsResult, msgsResult, locsResult, mediaResult, teamMsgsResult, activityResult] = await Promise.all([
      supabase.from('evidence_calls').select('*').eq('case_id', caseId),
      supabase.from('evidence_messages').select('*').eq('case_id', caseId),
      supabase.from('evidence_locations').select('*').eq('case_id', caseId),
      supabase.from('evidence_media').select('*').eq('case_id', caseId),
      supabase.from('team_messages').select('*').eq('case_id', caseId).order('timestamp', { ascending: true }),
      supabase.from('activity_logs').select('*').eq('case_id', caseId).order('timestamp', { ascending: false })
    ]);

    // Log any errors but don't fail the entire load
    if (callsResult.error) console.warn('Error fetching calls:', callsResult.error);
    if (msgsResult.error) console.warn('Error fetching messages:', msgsResult.error);
    if (locsResult.error) console.warn('Error fetching locations:', locsResult.error);
    if (mediaResult.error) console.warn('Error fetching media:', mediaResult.error);
    if (teamMsgsResult.error) console.warn('Error fetching team messages:', teamMsgsResult.error);
    if (activityResult.error) console.warn('Error fetching activity logs:', activityResult.error);

    // Ensure all arrays are properly initialized, even if queries fail
    const calls = Array.isArray(callsResult.data) ? callsResult.data : [];
    const messages = Array.isArray(msgsResult.data) ? msgsResult.data : [];
    const locations = Array.isArray(locsResult.data) ? locsResult.data : [];
    const media = Array.isArray(mediaResult.data) ? mediaResult.data : [];
    const teamMessages = Array.isArray(teamMsgsResult.data) ? teamMsgsResult.data : [];
    const activityLog = Array.isArray(activityResult.data) ? activityResult.data : [];

    console.log(`Loaded case ${caseId}: ${calls.length} calls, ${messages.length} messages, ${media.length} media items`);

    return {
      id: c.id,
      name: c.name,
      device: c.device || '',
      owner: c.owner || '',
      extractionDate: c.extraction_date || new Date().toISOString(),
      calls: calls,
      messages: messages,
      locations: locations,
      media: media.map(m => ({
          ...m,
          fileName: m.file_name || m.fileName || '',
          mimeType: m.mime_type || m.mimeType || '',
          // Ensure comments is an array
          comments: typeof m.comments === 'string' ? (() => {
            try {
              return JSON.parse(m.comments);
            } catch {
              return [];
            }
          })() : (Array.isArray(m.comments) ? m.comments : [])
      })),
      teamMessages: teamMessages.map(t => ({
          ...t,
          senderId: t.sender_id || t.senderId || '',
          fileName: t.file_name || t.fileName
      })),
      activityLog: activityLog.map(a => ({
          ...a,
          userId: a.user_id || a.userId || '',
          userName: a.user_name || a.userName || ''
      }))
    };
  } catch (error) {
    console.error('Failed to fetch full case:', error);
    return null;
  }
};

export const fetchAllCases = async () => {
  if (!supabase) return [];
  const { data } = await supabase.from('cases').select('id, name, extraction_date, device');
  return data || [];
};

export const deleteCaseFromDb = async (caseId: string) => {
  if(!supabase) {
    console.warn('Supabase not configured, skipping case deletion');
    return;
  }
  
  try {
    const { error } = await supabase.from('cases').delete().eq('id', caseId);
    if (error) {
      console.error('Error deleting case:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete case:', error);
    throw error;
  }
}

// --- EVIDENCE UPDATES ---
export const updateMediaComments = async (mediaId: string, comments: any[]) => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping media comments update');
    return;
  }
  
  try {
    const { error } = await supabase
      .from('evidence_media')
      .update({ comments: comments })
      .eq('id', mediaId);
    
    if (error) {
      console.error('Error updating media comments:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to update media comments:', error);
  }
};

// --- AI CHAT HISTORY ---

export const fetchAIChatHistory = async (caseId: string): Promise<ChatMessage[]> => {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('ai_chat_logs')
      .select('*')
      .eq('case_id', caseId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error fetching AI chat history:', error);
      return [];
    }
    
    // Map database format to ChatMessage format
    return (data || []).map(msg => ({
      id: msg.id || Date.now().toString(),
      role: msg.role,
      text: msg.text,
      timestamp: typeof msg.timestamp === 'string' 
        ? new Date(msg.timestamp).getTime() 
        : msg.timestamp || Date.now()
    }));
  } catch (error) {
    console.error('Failed to fetch AI chat history:', error);
    return [];
  }
};

export const saveAIChatMessage = async (caseId: string, message: ChatMessage) => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping chat message save');
    return;
  }
  
  try {
    const { error } = await supabase.from('ai_chat_logs').insert({
      id: message.id,
      case_id: caseId,
      role: message.role,
      text: message.text,
      timestamp: new Date(message.timestamp).toISOString()
    });
    
    if (error) {
      console.error('Error saving AI chat message:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to save AI chat message:', error);
  }
};

// --- AI INSIGHTS/REPORTS ---
export const saveAIInsight = async (caseId: string, insight: {
  id: string;
  type: 'report' | 'analysis' | 'summary';
  title: string;
  content: string;
  generatedBy: string;
  timestamp: string;
}) => {
  if (!supabase) {
    console.warn('Supabase not configured, skipping AI insight save');
    return;
  }
  
  try {
    const { error } = await supabase.from('ai_insights').insert({
      id: insight.id,
      case_id: caseId,
      type: insight.type,
      title: insight.title,
      content: insight.content,
      generated_by: insight.generatedBy,
      timestamp: insight.timestamp
    });
    
    if (error) {
      console.error('Error saving AI insight:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to save AI insight:', error);
  }
};

export const fetchAIInsights = async (caseId: string) => {
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('ai_insights')
      .select('*')
      .eq('case_id', caseId)
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching AI insights:', error);
      return [];
    }
    
    return (data || []).map(insight => ({
      id: insight.id,
      type: insight.type,
      title: insight.title,
      content: insight.content,
      generatedBy: insight.generated_by,
      timestamp: insight.timestamp
    }));
  } catch (error) {
    console.error('Failed to fetch AI insights:', error);
    return [];
  }
};

// --- LOGGING ---
export const logActivity = async (caseId: string, log: ActivityLog) => {
  if(!supabase) {
    console.warn('Supabase not configured, skipping activity log');
    return;
  }
  
  try {
    const { error } = await supabase.from('activity_logs').insert({
      id: log.id,
      case_id: caseId,
      user_id: log.userId,
      user_name: log.userName,
      action: log.action,
      target: log.target,
      timestamp: log.timestamp,
      type: log.type
    });
    
    if (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
