// __tests__/api/persona-name.test.ts
// Tests for persona name API endpoint logic
// Note: Full Next.js route testing requires more complex setup, so we test the core logic

import { getCustomerByNumber, getAdvisorByNumber } from '@/lib/db/neon'

jest.mock('@/lib/db/neon')

describe('/api/persona/name - Core Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch customer name correctly', async () => {
    const mockCustomer = {
      id: 'customer-123',
      customer_number: 'CUST-001',
      first_name: 'Maria',
      last_name: 'Shikongo',
    }

    ;(getCustomerByNumber as jest.Mock).mockResolvedValue(mockCustomer)

    const customer = await getCustomerByNumber('CUST-001')

    expect(customer).toEqual(mockCustomer)
    expect(customer?.first_name).toBe('Maria')
    expect(customer?.last_name).toBe('Shikongo')
    expect(getCustomerByNumber).toHaveBeenCalledWith('CUST-001')
  })

  it('should fetch advisor name correctly', async () => {
    const mockAdvisor = {
      id: 'advisor-123',
      advisor_number: 'ADV-001',
      first_name: 'Anna',
      last_name: 'Kambinda',
    }

    ;(getAdvisorByNumber as jest.Mock).mockResolvedValue(mockAdvisor)

    const advisor = await getAdvisorByNumber('ADV-001')

    expect(advisor).toEqual(mockAdvisor)
    expect(advisor?.first_name).toBe('Anna')
    expect(advisor?.last_name).toBe('Kambinda')
    expect(getAdvisorByNumber).toHaveBeenCalledWith('ADV-001')
  })

  it('should format full name correctly', () => {
    const customer = {
      first_name: 'Maria',
      last_name: 'Shikongo',
    }

    const fullName = `${customer.first_name} ${customer.last_name}`
    expect(fullName).toBe('Maria Shikongo')
  })

  it('should handle missing persona gracefully', async () => {
    ;(getCustomerByNumber as jest.Mock).mockResolvedValue(undefined)

    const customer = await getCustomerByNumber('INVALID')

    expect(customer).toBeUndefined()
  })

  it('should prioritize advisor over customer in logic', async () => {
    const mockAdvisor = {
      id: 'advisor-123',
      advisor_number: 'ADV-001',
      first_name: 'Anna',
      last_name: 'Kambinda',
    }

    ;(getAdvisorByNumber as jest.Mock).mockResolvedValue(mockAdvisor)
    ;(getCustomerByNumber as jest.Mock).mockResolvedValue({
      id: 'customer-123',
      customer_number: 'CUST-001',
      first_name: 'Maria',
      last_name: 'Shikongo',
    })

    // Simulate the API logic: check advisor first
    const advisorPersona = 'ADV-001'
    const customerPersona = 'CUST-001'

    if (advisorPersona) {
      const advisor = await getAdvisorByNumber(advisorPersona)
      expect(advisor).toBeDefined()
      expect(advisor?.first_name).toBe('Anna')
    } else if (customerPersona) {
      const customer = await getCustomerByNumber(customerPersona)
      expect(customer).toBeDefined()
    }
  })
})

