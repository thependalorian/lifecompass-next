// lib/agent/index.ts

import { getDeepSeekProvider } from "./providers";
import {
  hybridSearchTool,
  graphSearchTool,
  getCustomerPoliciesTool,
  getCustomerClaimsTool,
  getCustomerInteractionsTool,
  getCustomerProfileTool,
  getAdvisorProfileTool,
  getAdvisorTasksTool,
  recommendAdvisorsTool,
  searchDocumentsTool,
  calculatorTool,
  extractCalculationFromText,
} from "./tools";
import {
  AgentDependencies,
  AgentResponse,
  ChatRequest,
  ToolCall,
  ChunkResult,
  GraphSearchResult,
} from "./models";
import { CUSTOMER_SYSTEM_PROMPT, ADVISER_SYSTEM_PROMPT } from "./prompts";
import {
  detectQueryIntent,
  preSelectTools,
  buildContextFromPreSelected,
} from "./shared";
import {
  createSession,
  getOrCreateSessionByPersona,
  addMessage,
  getSessionMessages,
  getCustomerByNumber,
  getCustomerPolicies,
  getCustomerClaims,
  getAdvisorByNumber,
  getAdvisorById,
  getAllAdvisors,
  getAdvisorClients,
  createChatInteraction,
} from "@/lib/db/neon";

export class LifeCompassAgent {
  private llm: ReturnType<typeof getDeepSeekProvider>;
  private dependencies: AgentDependencies;

  constructor(dependencies: AgentDependencies) {
    this.llm = getDeepSeekProvider();
    this.dependencies = dependencies;
  }

  private getSystemPrompt(): string {
    // Determine which prompt to use based on user type
    const userType = this.dependencies.metadata?.userType || "customer";
    return userType === "advisor"
      ? ADVISER_SYSTEM_PROMPT
      : CUSTOMER_SYSTEM_PROMPT;
  }

  async executeAgent(request: ChatRequest): Promise<AgentResponse> {
    const { message, sessionId, userId, metadata } = request;

    // Security: Validate user isolation
    const validatedUserId = this.validateUserAccess(userId, metadata);

    // Get selected persona from metadata (auto-populated from sessionStorage)
    const selectedCustomerPersona = metadata?.selectedCustomerPersona;
    const selectedAdvisorPersona = metadata?.selectedAdvisorPersona;

    // Get or create session based on persona (ensures conversation isolation)
    const activeSessionId = await getOrCreateSessionByPersona(
      validatedUserId,
      {
        selectedCustomerPersona,
        selectedAdvisorPersona,
        userType:
          metadata?.userType ||
          (selectedAdvisorPersona ? "advisor" : "customer"),
      },
      sessionId,
    );

    // Save user message
    await addMessage(activeSessionId, "user", message, metadata);

    // Create interaction record for CRM tracking
    await createChatInteraction(activeSessionId, message, "user");

    // Get conversation history
    const history = await getSessionMessages(activeSessionId, 10);

    // Build CRM context automatically if persona is selected
    // IMPORTANT: Strict separation - customers see THEIR OWN data, advisors see CLIENT data
    let crmContext = "";
    if (selectedCustomerPersona) {
      // CUSTOMER FLOW: Customer viewing their own data
      try {
        const customer = await getCustomerByNumber(selectedCustomerPersona);
        if (customer) {
          // Security: Verify user has access to this customer
          const hasAccess = await this.verifyCustomerAccess(
            validatedUserId,
            customer.id,
          );
          if (!hasAccess) {
            throw new Error("Access denied to customer data");
          }

          const policies = await getCustomerPolicies(customer.id);
          const claims = await getCustomerClaims(customer.id);

          // Use "your" language for customers (first person perspective)
          crmContext = `You are ${customer.first_name} ${customer.last_name} (${customer.customer_number}), ${customer.segment} segment. You have ${policies.length} active policies and ${claims.length} claims. `;

          if (policies.length > 0) {
            crmContext += `Your active policies: ${policies
              .map((p: any) => `${p.product_type} (${p.policy_number})`)
              .join(", ")}. `;
          }
          
          if (claims.length > 0) {
            const outstandingClaims = claims.filter((c: any) => 
              c.status && !["Paid", "Closed", "Denied"].includes(c.status)
            );
            if (outstandingClaims.length > 0) {
              crmContext += `You have ${outstandingClaims.length} outstanding claim(s). `;
            }
          }

          // Add advisor information if assigned
          if (customer.primary_advisor_id) {
            try {
              const advisor = await getAdvisorById(customer.primary_advisor_id);
              if (advisor) {
                crmContext += `Your assigned financial advisor is ${advisor.first_name} ${advisor.last_name} (${advisor.advisor_number}). `;
                if (advisor.specialization) {
                  crmContext += `They specialize in ${advisor.specialization}. `;
                }
                if (advisor.phone) {
                  crmContext += `Contact: ${advisor.phone}. `;
                }
                if (advisor.email) {
                  crmContext += `Email: ${advisor.email}. `;
                }
              }
            } catch (error) {
              console.error("Failed to load advisor info:", error);
            }
          } else {
            // No advisor assigned - mention advisor recommendation capability
            crmContext += `You currently do not have an assigned advisor. The system can recommend advisors based on your needs and specialization (e.g., Life Insurance, Investment & Retirement, Wealth Management, Business Solutions). `;
          }
        }
      } catch (error) {
        console.error("Failed to load customer context:", error);
        // Continue without CRM context if access denied or error
      }
    } else if (selectedAdvisorPersona) {
      try {
        const advisor = await getAdvisorByNumber(selectedAdvisorPersona);
        if (advisor) {
          // Security: Verify user has access to this advisor
          const hasAccess = await this.verifyAdvisorAccess(
            validatedUserId,
            advisor.id,
          );
          if (!hasAccess) {
            throw new Error("Access denied to advisor data");
          }

          const clients = await getAdvisorClients(advisor.id);

          // Use "your clients" language for advisors (third person perspective for clients)
          crmContext = `You are ${advisor.first_name} ${advisor.last_name} (${advisor.advisor_number}), a ${advisor.specialization} specialist. You manage ${clients.length} active clients. When customers ask about their data, you are viewing it as their advisor, not as the customer themselves. `;
        }
      } catch (error) {
        console.error("Failed to load advisor context:", error);
        // Continue without CRM context if access denied or error
      }
    }

    // Perform search with intelligent tool selection (using shared utilities)
    const intent = detectQueryIntent(message);
    const { useVector, useGraph } = this.dependencies.searchPreferences || {
      useVector: true,
      useGraph: true,
    };

    const preSelected = await preSelectTools(
      message,
      intent,
      selectedCustomerPersona,
      selectedAdvisorPersona,
      useVector,
      useGraph,
    );

    // Build context from search results and CRM data (using shared utilities)
    // Pass persona type to ensure correct perspective (first-person for customers)
    const isCustomerPersona = !!selectedCustomerPersona;
    const context = buildContextFromPreSelected(
      preSelected,
      crmContext,
      isCustomerPersona,
    );

    // Map to expected format for compatibility
    const searchResults = {
      sources: preSelected.sources,
      toolsUsed: preSelected.toolsUsed,
      crmData: preSelected.crmData,
    };

    // Build messages for LLM
    const messages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }> = [
      { role: "system", content: this.getSystemPrompt() },
      ...(crmContext ? [{ role: "system", content: crmContext } as const] : []),
      { role: "system", content: `Relevant context:\n${context}` },
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // Get LLM response
    const response = await this.llm.chat(messages);

    // Save assistant message
    await addMessage(activeSessionId, "assistant", response, {
      toolsUsed: searchResults.toolsUsed,
      personaContext: crmContext ? "loaded" : "none",
    });

    return {
      message: response,
      sessionId: activeSessionId,
      sources: searchResults.sources,
      toolsUsed: searchResults.toolsUsed,
      metadata: {
        searchType: request.searchType || "hybrid",
        personaContext: crmContext ? "loaded" : "none",
      },
    };
  }

  // NOTE: Query intent detection, tool pre-selection, and context building are handled by
  // lib/agent/shared.ts utilities (detectQueryIntent, preSelectTools, buildContextFromPreSelected)

  // Security: Validate user access
  private validateUserAccess(
    userId?: string,
    metadata?: Record<string, any>,
  ): string {
    // For now, use userId or generate a session-based ID
    // In production, this should validate against authentication system
    return userId || metadata?.sessionId || "anonymous";
  }

  // Security: Verify customer access
  private async verifyCustomerAccess(
    userId: string,
    customerId: string,
  ): Promise<boolean> {
    // HACKATHON DEMO: Access control intentionally omitted
    // No authentication required for demo purposes - all personas accessible
    //
    // For production deployment, implement proper access control:
    // - Check if user is the customer
    // - Check if user is an advisor assigned to this customer
    // - Check if user has admin privileges
    return true; // Intentionally skipped for hackathon demo
  }

  // Security: Verify advisor access
  private async verifyAdvisorAccess(
    userId: string,
    advisorId: string,
  ): Promise<boolean> {
    // HACKATHON DEMO: Access control intentionally omitted
    // No authentication required for demo purposes - all personas accessible
    //
    // For production deployment, implement proper access control:
    // - Check if user is the advisor
    // - Check if user has admin privileges
    return true; // Intentionally skipped for hackathon demo
  }

  async streamResponse(request: ChatRequest) {
    // Similar to executeAgent but returns a stream
    const { message, sessionId, userId, metadata } = request;

    let activeSessionId: string = "";

    try {
      // Security: Validate user access
      const validatedUserId = this.validateUserAccess(userId, metadata);

      // Get selected persona from metadata
      const selectedCustomerPersona = metadata?.selectedCustomerPersona;
      const selectedAdvisorPersona = metadata?.selectedAdvisorPersona;

      // Get or create session based on persona (ensures conversation isolation)
      activeSessionId = await getOrCreateSessionByPersona(
        validatedUserId,
        {
          selectedCustomerPersona,
          selectedAdvisorPersona,
          userType:
            metadata?.userType ||
            (selectedAdvisorPersona ? "advisor" : "customer"),
        },
        sessionId,
      );

      // Save user message (non-blocking - continue even if this fails)
      try {
        await addMessage(activeSessionId, "user", message, metadata);
      } catch (error) {
        console.error("Failed to save user message:", error);
        // Continue - don't block streaming
      }

      // Create interaction record for CRM tracking (non-blocking)
      try {
        await createChatInteraction(activeSessionId, message, "user");
      } catch (error) {
        console.error("Failed to create interaction record:", error);
        // Continue - don't block streaming
      }

      // Build CRM context automatically
      // IMPORTANT: Strict separation - customers see THEIR OWN data, advisors see CLIENT data
      let crmContext = "";

      if (selectedCustomerPersona) {
        // CUSTOMER FLOW: Customer viewing their own data
        try {
          const customer = await getCustomerByNumber(selectedCustomerPersona);
          if (customer) {
            const hasAccess = await this.verifyCustomerAccess(
              validatedUserId,
              customer.id,
            );
            if (hasAccess) {
              try {
                const [policies, claims] = await Promise.all([
                  getCustomerPolicies(customer.id).catch(() => []),
                  getCustomerClaims(customer.id).catch(() => []),
                ]);

                // Use "your" language for customers (first person perspective)
                crmContext = `You are ${customer.first_name} ${customer.last_name} (${customer.customer_number}), ${customer.segment} segment. You have ${policies.length} active policies and ${claims.length} claims. `;
                
                if (claims.length > 0) {
                  const outstandingClaims = claims.filter((c: any) => 
                    c.status && !["Paid", "Closed", "Denied"].includes(c.status)
                  );
                  if (outstandingClaims.length > 0) {
                    crmContext += `You have ${outstandingClaims.length} outstanding claim(s). `;
                  }
                }

                // Add advisor information if assigned
                if (customer.primary_advisor_id) {
                  try {
                    const advisor = await getAdvisorById(customer.primary_advisor_id);
                    if (advisor) {
                      crmContext += `Your assigned financial advisor is ${advisor.first_name} ${advisor.last_name} (${advisor.advisor_number}). `;
                      if (advisor.specialization) {
                        crmContext += `They specialize in ${advisor.specialization}. `;
                      }
                      if (advisor.phone) {
                        crmContext += `Contact: ${advisor.phone}. `;
                      }
                      if (advisor.email) {
                        crmContext += `Email: ${advisor.email}. `;
                      }
                    }
                  } catch (error) {
                    console.error("Failed to load advisor info:", error);
                  }
                } else {
                  // No advisor assigned - mention advisor recommendation capability
                  crmContext += `You currently do not have an assigned advisor. The system can recommend advisors based on your needs and specialization (e.g., Life Insurance, Investment & Retirement, Wealth Management, Business Solutions). `;
                }
              } catch (error) {
                console.error("Failed to load customer policies/claims:", error);
                // Continue with basic context
                crmContext = `You are ${customer.first_name} ${customer.last_name} (${customer.customer_number}), ${customer.segment} segment. `;
              }
            }
          }
        } catch (error) {
          console.error("Failed to load customer context:", error);
          // Continue without CRM context
        }
      } else if (selectedAdvisorPersona) {
        try {
          const advisor = await getAdvisorByNumber(selectedAdvisorPersona);
          if (advisor) {
            const hasAccess = await this.verifyAdvisorAccess(
              validatedUserId,
              advisor.id,
            );
            if (hasAccess) {
              try {
                const clients = await getAdvisorClients(advisor.id);
                // Use "your clients" language for advisors (third person perspective for clients)
                crmContext = `You are ${advisor.first_name} ${advisor.last_name} (${advisor.advisor_number}), a ${advisor.specialization} specialist. You manage ${clients.length} active clients. When customers ask about their data, you are viewing it as their advisor, not as the customer themselves. `;
              } catch (error) {
                console.error("Failed to load advisor clients:", error);
                // Continue with basic context
                crmContext = `You are ${advisor.first_name} ${advisor.last_name} (${advisor.advisor_number}), a ${advisor.specialization} specialist. `;
              }
            }
          }
        } catch (error) {
          console.error("Failed to load advisor context:", error);
          // Continue without CRM context
        }
      }

      // Get conversation history (with error handling)
      let history: Array<{ role: string; content: string }> = [];
      try {
        history = await getSessionMessages(activeSessionId, 10);
      } catch (error) {
        console.error("Failed to load conversation history:", error);
        // Continue with empty history
      }

      // Use shared intelligent tool selection (eliminates duplication)
      const intent = detectQueryIntent(message);
      const { useVector, useGraph } = this.dependencies.searchPreferences || {
        useVector: true,
        useGraph: true,
      };

      // Pre-select tools with error handling
      let preSelected;
      try {
        preSelected = await preSelectTools(
          message,
          intent,
          selectedCustomerPersona,
          selectedAdvisorPersona,
          useVector,
          useGraph,
        );
      } catch (error) {
        console.error("Failed to pre-select tools:", error);
        // Fallback: empty tools
        preSelected = {
          crmData: {},
          toolsUsed: [],
          sources: [],
        };
      }

      // Build context using shared utility (eliminates duplication)
      // Pass persona type to ensure correct perspective (first-person for customers)
      const isCustomerPersona = !!selectedCustomerPersona;
      const context = buildContextFromPreSelected(
        preSelected,
        crmContext,
        isCustomerPersona,
      );

      // Map to expected format for compatibility
      const searchResults = {
        sources: preSelected.sources || [],
        toolsUsed: preSelected.toolsUsed || [],
        crmData: preSelected.crmData || {},
      };

      const messages: Array<{
        role: "user" | "assistant" | "system";
        content: string;
      }> = [
        { role: "system", content: this.getSystemPrompt() },
        ...(crmContext ? [{ role: "system", content: crmContext } as const] : []),
        { role: "system", content: `Relevant context:\n${context}` },
        ...history.map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        })),
        { role: "user", content: message },
      ];

      // Stream LLM response with error handling
      let stream;
      try {
        stream = await this.llm.streamChat(messages);
      } catch (error) {
        console.error("Failed to stream LLM response:", error);
        throw new Error("Failed to generate response. Please try again.");
      }

      return {
        stream,
        sessionId: activeSessionId,
        sources: searchResults.sources,
        toolsUsed: searchResults.toolsUsed,
      };
    } catch (error) {
      // Log error with context
      console.error("[Agent] streamResponse error:", {
        error: error instanceof Error ? error.message : String(error),
        sessionId: activeSessionId || "unknown",
        userId: userId || "unknown",
        message: message.substring(0, 100),
      });

      // Re-throw to be handled by API route
      throw error;
    }
  }
}

// Factory function
export function createAgent(dependencies: AgentDependencies) {
  return new LifeCompassAgent(dependencies);
}
