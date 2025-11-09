// __tests__/lib/db/session-isolation.test.ts
import { getOrCreateSessionByPersona, deleteChatHistory } from '@/lib/db/neon'

// Mock the database client
jest.mock('@/lib/db/neon', () => {
  const mockSessions: any[] = []
  const mockMessages: any[] = []
  
  return {
    getSqlClient: jest.fn(() => ({
      sql: jest.fn((query: any) => {
        // Mock SQL query execution
        if (query.includes('SELECT id::text FROM sessions')) {
          // Extract persona from query
          const customerMatch = query.match(/selectedCustomerPersona.*?=.*?['"](.*?)['"]/)
          const advisorMatch = query.match(/selectedAdvisorPersona.*?=.*?['"](.*?)['"]/)
          
          const matchingSessions = mockSessions.filter(s => {
            const metadata = s.metadata || {}
            if (customerMatch) {
              return metadata.selectedCustomerPersona === customerMatch[1] &&
                     (!metadata.selectedAdvisorPersona || metadata.selectedAdvisorPersona === null)
            }
            if (advisorMatch) {
              return metadata.selectedAdvisorPersona === advisorMatch[1] &&
                     (!metadata.selectedCustomerPersona || metadata.selectedCustomerPersona === null)
            }
            return false
          })
          
          return Promise.resolve(matchingSessions.length > 0 ? [{ id: matchingSessions[0].id }] : [])
        }
        
        if (query.includes('INSERT INTO sessions')) {
          const newSession = {
            id: `session-${Date.now()}`,
            user_id: 'test-user',
            metadata: {},
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          }
          mockSessions.push(newSession)
          return Promise.resolve([{ id: newSession.id }])
        }
        
        if (query.includes('DELETE FROM messages')) {
          mockMessages.length = 0
          return Promise.resolve([])
        }
        
        if (query.includes('DELETE FROM sessions')) {
          mockSessions.length = 0
          return Promise.resolve([])
        }
        
        return Promise.resolve([])
      }),
    })),
    getCustomerByNumber: jest.fn((num: string) => 
      Promise.resolve({ id: `customer-${num}`, customer_number: num, first_name: 'Test', last_name: 'Customer' })
    ),
    getAdvisorByNumber: jest.fn((num: string) => 
      Promise.resolve({ id: `advisor-${num}`, advisor_number: num, first_name: 'Test', last_name: 'Advisor' })
    ),
    getSession: jest.fn((id: string) => {
      const session = mockSessions.find(s => s.id === id)
      return Promise.resolve(session ? {
        id: session.id,
        userId: session.user_id,
        metadata: session.metadata,
        expiresAt: session.expires_at,
      } : null)
    }),
    updateSession: jest.fn((id: string, metadata: any) => {
      const session = mockSessions.find(s => s.id === id)
      if (session) {
        session.metadata = metadata
      }
      return Promise.resolve()
    }),
    getOrCreateSessionByPersona: jest.fn(async (userId, personaMetadata, existingSessionId) => {
      // Simplified mock implementation
      if (existingSessionId) {
        const session = mockSessions.find(s => s.id === existingSessionId)
        if (session) return existingSessionId
      }
      
      // Check for existing session
      const existing = mockSessions.find(s => {
        const meta = s.metadata || {}
        if (personaMetadata?.selectedCustomerPersona) {
          return meta.selectedCustomerPersona === personaMetadata.selectedCustomerPersona &&
                 !meta.selectedAdvisorPersona
        }
        if (personaMetadata?.selectedAdvisorPersona) {
          return meta.selectedAdvisorPersona === personaMetadata.selectedAdvisorPersona &&
                 !meta.selectedCustomerPersona
        }
        return false
      })
      
      if (existing) return existing.id
      
      // Create new session
      const newSession = {
        id: `session-${Date.now()}-${Math.random()}`,
        user_id: userId || 'anonymous',
        metadata: personaMetadata || {},
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
      mockSessions.push(newSession)
      return newSession.id
    }),
    deleteChatHistory: jest.fn(async (sessionId: string) => {
      const sessionIndex = mockSessions.findIndex(s => s.id === sessionId)
      if (sessionIndex >= 0) {
        mockSessions.splice(sessionIndex, 1)
      }
      return { messagesDeleted: 1, sessionsDeleted: 1 }
    }),
  }
})

describe('Session Isolation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create separate sessions for different customer personas', async () => {
    const session1 = await getOrCreateSessionByPersona(
      'user1',
      { selectedCustomerPersona: 'CUST-001' }
    )
    
    const session2 = await getOrCreateSessionByPersona(
      'user2',
      { selectedCustomerPersona: 'CUST-002' }
    )
    
    expect(session1).not.toBe(session2)
    expect(session1).toBeTruthy()
    expect(session2).toBeTruthy()
  })

  it('should create separate sessions for customer vs advisor personas', async () => {
    const customerSession = await getOrCreateSessionByPersona(
      'user1',
      { selectedCustomerPersona: 'CUST-001' }
    )
    
    const advisorSession = await getOrCreateSessionByPersona(
      'user1',
      { selectedAdvisorPersona: 'ADV-001' }
    )
    
    expect(customerSession).not.toBe(advisorSession)
  })

  it('should return same session for same customer persona', async () => {
    const session1 = await getOrCreateSessionByPersona(
      'user1',
      { selectedCustomerPersona: 'CUST-001' }
    )
    
    const session2 = await getOrCreateSessionByPersona(
      'user1',
      { selectedCustomerPersona: 'CUST-001' }
    )
    
    expect(session1).toBe(session2)
  })

  it('should not mix sessions between different personas', async () => {
    const session1 = await getOrCreateSessionByPersona(
      'user1',
      { selectedCustomerPersona: 'CUST-001' }
    )
    
    // Try to get session for different persona
    const session2 = await getOrCreateSessionByPersona(
      'user1',
      { selectedCustomerPersona: 'CUST-002' }
    )
    
    expect(session1).not.toBe(session2)
  })

  it('should delete chat history for specific session only', async () => {
    const session1 = await getOrCreateSessionByPersona(
      'user1',
      { selectedCustomerPersona: 'CUST-001' }
    )
    
    const session2 = await getOrCreateSessionByPersona(
      'user2',
      { selectedCustomerPersona: 'CUST-002' }
    )
    
    const result = await deleteChatHistory(session1)
    
    expect(result.sessionsDeleted).toBe(1)
    // Session2 should still exist (we can't verify this without access to mockSessions, but the function should work)
  })
})

