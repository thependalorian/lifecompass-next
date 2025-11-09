// __tests__/lib/hooks/usePersonaState.test.ts
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePersonaState, dispatchPersonaChanged } from '@/lib/hooks/usePersonaState'

describe('usePersonaState', () => {
  beforeEach(() => {
    // Clear sessionStorage before each test
    sessionStorage.clear()
  })

  it('should initialize with null personas', () => {
    const { result } = renderHook(() => usePersonaState())
    
    expect(result.current.customerPersona).toBeNull()
    expect(result.current.advisorPersona).toBeNull()
    expect(result.current.userType).toBe('customer')
  })

  it('should read customer persona from sessionStorage', () => {
    sessionStorage.setItem('selectedCustomerPersona', 'CUST-001')
    
    const { result } = renderHook(() => usePersonaState())
    
    expect(result.current.customerPersona).toBe('CUST-001')
    expect(result.current.advisorPersona).toBeNull()
    expect(result.current.userType).toBe('customer')
  })

  it('should read advisor persona from sessionStorage', () => {
    sessionStorage.setItem('selectedAdvisorPersona', 'ADV-001')
    
    const { result } = renderHook(() => usePersonaState())
    
    expect(result.current.advisorPersona).toBe('ADV-001')
    expect(result.current.customerPersona).toBeNull()
    expect(result.current.userType).toBe('advisor')
  })

  it('should update when sessionStorage changes via storage event', async () => {
    const { result } = renderHook(() => usePersonaState())
    
    expect(result.current.customerPersona).toBeNull()
    
    // Simulate storage event from another tab/window
    // Note: StorageEvent only fires for cross-tab changes, not same-tab
    // So we manually update sessionStorage and trigger the custom event
    act(() => {
      sessionStorage.setItem('selectedCustomerPersona', 'CUST-002')
      dispatchPersonaChanged()
    })
    
    await waitFor(() => {
      expect(result.current.customerPersona).toBe('CUST-002')
    })
  })

  it('should update when personaChanged event is dispatched', async () => {
    const { result } = renderHook(() => usePersonaState())
    
    expect(result.current.customerPersona).toBeNull()
    
    // Simulate persona change
    act(() => {
      sessionStorage.setItem('selectedCustomerPersona', 'CUST-003')
      dispatchPersonaChanged()
    })
    
    await waitFor(() => {
      expect(result.current.customerPersona).toBe('CUST-003')
    })
  })

  it('should prioritize advisor persona over customer persona', () => {
    sessionStorage.setItem('selectedCustomerPersona', 'CUST-001')
    sessionStorage.setItem('selectedAdvisorPersona', 'ADV-001')
    
    const { result } = renderHook(() => usePersonaState())
    
    expect(result.current.advisorPersona).toBe('ADV-001')
    expect(result.current.customerPersona).toBe('CUST-001')
    expect(result.current.userType).toBe('advisor')
  })
})

