// lib/agent/index.ts

import { getDeepSeekProvider } from "./providers";
import {
  vectorSearchTool,
  hybridSearchTool,
  graphSearchTool,
  getDocumentTool,
  getEntityRelationshipsTool,
  // CRM Tools
  getCustomerProfileTool,
  getCustomerPoliciesTool,
  getCustomerClaimsTool,
  getCustomerInteractionsTool,
  getAdvisorProfileTool,
  getAdvisorTasksTool,
  listAvailableDocumentsTool,
  searchDocumentsTool,
  // Calculator Tool
  calculatorTool,
  extractCalculationFromText,
} from "./tools";
import {
  AgentDependencies,
  AgentResponse,
  ChatRequest,
  ToolCall,
  ChunkResult,
} from "./models";
import { CUSTOMER_SYSTEM_PROMPT, ADVISER_SYSTEM_PROMPT } from "./prompts";
import {
  createSession,
  addMessage,
  getSessionMessages,
  getCustomerByNumber,
  getCustomerPolicies,
  getCustomerClaims,
  getAdvisorByNumber,
  getAdvisorClients,
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

    // Create or use existing session
    const activeSessionId = sessionId || (await createSession(validatedUserId));

    // Get selected persona from metadata (auto-populated from sessionStorage)
    const selectedCustomerPersona = metadata?.selectedCustomerPersona;
    const selectedAdvisorPersona = metadata?.selectedAdvisorPersona;

    // Save user message
    await addMessage(activeSessionId, "user", message, metadata);

    // Get conversation history
    const history = await getSessionMessages(activeSessionId, 10);

    // Build CRM context automatically if persona is selected
    let crmContext = "";
    if (selectedCustomerPersona) {
      try {
        const customer = await getCustomerByNumber(selectedCustomerPersona);
        if (customer) {
          // Security: Verify user has access to this customer
          const hasAccess = await this.verifyCustomerAccess(
            validatedUserId,
            customer.id
          );
          if (!hasAccess) {
            throw new Error("Access denied to customer data");
          }

          const policies = await getCustomerPolicies(customer.id);
          const claims = await getCustomerClaims(customer.id);

          crmContext = `Customer Context: ${customer.first_name} ${customer.last_name} (${customer.customer_number}), ${customer.segment} segment, ${policies.length} active policies, ${claims.length} claims. `;

          if (policies.length > 0) {
            crmContext += `Active policies: ${policies
              .map((p: any) => `${p.product_type} (${p.policy_number})`)
              .join(", ")}. `;
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
            advisor.id
          );
          if (!hasAccess) {
            throw new Error("Access denied to advisor data");
          }

          const clients = await getAdvisorClients(advisor.id);

          crmContext = `Advisor Context: ${advisor.first_name} ${advisor.last_name} (${advisor.advisor_number}), ${advisor.specialization} specialist, ${clients.length} active clients. `;
        }
      } catch (error) {
        console.error("Failed to load advisor context:", error);
        // Continue without CRM context if access denied or error
      }
    }

    // Perform search with intelligent tool selection
    const searchResults = await this.performSearch(
      message,
      selectedCustomerPersona,
      selectedAdvisorPersona
    );

    // Build context from search results and CRM data
    const context = this.buildContext(searchResults, crmContext);

    // Build messages for LLM
    const messages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }> = [
      { role: "system", content: this.getSystemPrompt() },
      ...(crmContext
        ? [{ role: "system", content: crmContext } as const]
        : []),
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

  private async performSearch(
    query: string,
    selectedCustomerPersona?: string,
    selectedAdvisorPersona?: string
  ): Promise<{
    sources: ChunkResult[];
    toolsUsed: ToolCall[];
    crmData?: any;
  }> {
    const { useVector, useGraph } = this.dependencies.searchPreferences || {
      useVector: true,
      useGraph: true,
    };

    const sources: ChunkResult[] = [];
    const toolsUsed: ToolCall[] = [];
    let crmData: any = null;

    // Detect query intent for intelligent tool selection
    const queryLower = query.toLowerCase();
    const isPolicyQuery =
      queryLower.includes("policy") || queryLower.includes("policies");
    const isClaimQuery =
      queryLower.includes("claim") || queryLower.includes("claims");
    const isDocumentQuery =
      queryLower.includes("form") ||
      queryLower.includes("document") ||
      queryLower.includes("guide") ||
      queryLower.includes("pdf");
    const isTaskQuery =
      queryLower.includes("task") || queryLower.includes("tasks");
    const isProfileQuery =
      queryLower.includes("profile") ||
      queryLower.includes("information") ||
      queryLower.includes("details");
    const isInteractionQuery =
      queryLower.includes("interaction") ||
      queryLower.includes("history") ||
      queryLower.includes("previous");
    const isCalculationQuery =
      queryLower.includes("calculate") ||
      queryLower.includes("compute") ||
      queryLower.includes("work out") ||
      queryLower.includes("what is") ||
      queryLower.includes("how much") ||
      /[\d+\-*/().]/.test(query); // Contains math operators

    // Use CRM tools if relevant and persona is selected
    if (selectedCustomerPersona) {
      try {
        if (isPolicyQuery) {
          const policies = await getCustomerPoliciesTool({
            customerNumber: selectedCustomerPersona,
          });
          crmData = { ...crmData, policies };
          toolsUsed.push({
            toolName: "get_customer_policies",
            args: { customerNumber: selectedCustomerPersona },
          });
        }
        if (isClaimQuery) {
          const claims = await getCustomerClaimsTool({
            customerNumber: selectedCustomerPersona,
          });
          crmData = { ...crmData, claims };
          toolsUsed.push({
            toolName: "get_customer_claims",
            args: { customerNumber: selectedCustomerPersona },
          });
        }
        if (isInteractionQuery) {
          const interactions = await getCustomerInteractionsTool({
            customerNumber: selectedCustomerPersona,
            limit: 10,
          });
          crmData = { ...crmData, interactions };
          toolsUsed.push({
            toolName: "get_customer_interactions",
            args: { customerNumber: selectedCustomerPersona },
          });
        }
        if (isProfileQuery) {
          const profile = await getCustomerProfileTool({
            customerNumber: selectedCustomerPersona,
          });
          crmData = { ...crmData, profile };
          toolsUsed.push({
            toolName: "get_customer_profile",
            args: { customerNumber: selectedCustomerPersona },
          });
        }
      } catch (error) {
        console.error("CRM tool execution failed:", error);
      }
    }

    if (selectedAdvisorPersona) {
      try {
        if (isTaskQuery) {
          const tasks = await getAdvisorTasksTool({
            advisorNumber: selectedAdvisorPersona,
          });
          crmData = { ...crmData, tasks };
          toolsUsed.push({
            toolName: "get_advisor_tasks",
            args: { advisorNumber: selectedAdvisorPersona },
          });
        }
        if (isProfileQuery) {
          const profile = await getAdvisorProfileTool({
            advisorNumber: selectedAdvisorPersona,
          });
          crmData = { ...crmData, profile };
          toolsUsed.push({
            toolName: "get_advisor_profile",
            args: { advisorNumber: selectedAdvisorPersona },
          });
        }
      } catch (error) {
        console.error("CRM tool execution failed:", error);
      }
    }

    // Document search (available to all users)
    if (isDocumentQuery) {
      try {
        const documents = await searchDocumentsTool({ query });
        crmData = { ...crmData, documents };
        toolsUsed.push({
          toolName: "search_documents",
          args: { query },
        });
      } catch (error) {
        console.error("Document search failed:", error);
      }
    }

    // Calculator (available to all users)
    if (isCalculationQuery) {
      try {
        const calcInfo = extractCalculationFromText(query);
        if (calcInfo.hasCalculation && calcInfo.expression) {
          const calcResult = await calculatorTool({
            expression: calcInfo.expression,
            calculationType: calcInfo.calculationType,
            variables: calcInfo.variables,
          });
          crmData = { ...crmData, calculation: calcResult };
          toolsUsed.push({
            toolName: "calculator",
            args: {
              expression: calcInfo.expression,
              calculationType: calcInfo.calculationType,
              variables: calcInfo.variables,
            },
          });
        }
      } catch (error) {
        console.error("Calculator tool failed:", error);
      }
    }

    // Vector/Hybrid search (knowledge base)
    if (useVector) {
      const vectorResults = await hybridSearchTool({ query, limit: 5 });
      sources.push(...vectorResults);
      toolsUsed.push({
        toolName: "hybrid_search",
        args: { query, limit: 5 },
      });
    }

    // Graph search (knowledge graph)
    if (useGraph) {
      const graphResults = await graphSearchTool({ query });
      toolsUsed.push({
        toolName: "graph_search",
        args: { query },
      });
    }

    return { sources, toolsUsed, crmData };
  }

  private buildContext(
    searchResults: {
    sources: ChunkResult[];
    toolsUsed: ToolCall[];
      crmData?: any;
    },
    crmContext?: string
  ): string {
    const contextParts: string[] = [];

    // Add CRM context if available
    if (crmContext) {
      contextParts.push(crmContext);
    }

    // Add CRM data from tools
    if (searchResults.crmData) {
      if (searchResults.crmData.policies) {
        contextParts.push(
          `Customer Policies:\n${JSON.stringify(
            searchResults.crmData.policies,
            null,
            2
          )}`
        );
      }
      if (searchResults.crmData.claims) {
        contextParts.push(
          `Customer Claims:\n${JSON.stringify(
            searchResults.crmData.claims,
            null,
            2
          )}`
        );
      }
      if (searchResults.crmData.interactions) {
        contextParts.push(
          `Customer Interactions:\n${JSON.stringify(
            searchResults.crmData.interactions,
            null,
            2
          )}`
        );
      }
      if (searchResults.crmData.tasks) {
        contextParts.push(
          `Advisor Tasks:\n${JSON.stringify(
            searchResults.crmData.tasks,
            null,
            2
          )}`
        );
      }
      if (searchResults.crmData.documents) {
        contextParts.push(
          `Available Documents:\n${JSON.stringify(
            searchResults.crmData.documents,
            null,
            2
          )}`
        );
      }
      if (searchResults.crmData.profile) {
        contextParts.push(
          `Profile Data:\n${JSON.stringify(
            searchResults.crmData.profile,
            null,
            2
          )}`
        );
      }
      if (searchResults.crmData.calculation) {
        const calc = searchResults.crmData.calculation;
        if (calc.error) {
          contextParts.push(`Calculation Error: ${calc.message}`);
        } else {
          contextParts.push(
            `Calculation Result:\nFormula: ${calc.formula}\nResult: ${calc.result}\nType: ${calc.calculationType}`
          );
    }
      }
    }

    // Add knowledge base sources
    if (searchResults.sources.length > 0) {
      contextParts.push(
        searchResults.sources
      .map(
        (source, idx) =>
              `[Source ${idx + 1}: ${source.documentTitle}]\n${source.content}\n`
      )
          .join("\n---\n")
      );
    }

    return contextParts.length > 0
      ? contextParts.join("\n\n---\n\n")
      : "No relevant context found in the knowledge base.";
  }

  // Security: Validate user access
  private validateUserAccess(
    userId?: string,
    metadata?: Record<string, any>
  ): string {
    // For now, use userId or generate a session-based ID
    // In production, this should validate against authentication system
    return userId || metadata?.sessionId || "anonymous";
  }

  // Security: Verify customer access
  private async verifyCustomerAccess(
    userId: string,
    customerId: string
  ): Promise<boolean> {
    // For demo purposes, allow access
    // In production, implement proper access control:
    // - Check if user is the customer
    // - Check if user is an advisor assigned to this customer
    // - Check if user has admin privileges
    return true; // TODO: Implement proper access control
  }

  // Security: Verify advisor access
  private async verifyAdvisorAccess(
    userId: string,
    advisorId: string
  ): Promise<boolean> {
    // For demo purposes, allow access
    // In production, implement proper access control:
    // - Check if user is the advisor
    // - Check if user has admin privileges
    return true; // TODO: Implement proper access control
  }

  async streamResponse(request: ChatRequest) {
    // Similar to executeAgent but returns a stream
    const { message, sessionId, userId, metadata } = request;

    // Security: Validate user access
    const validatedUserId = this.validateUserAccess(userId, metadata);

    // Get selected persona from metadata
    const selectedCustomerPersona = metadata?.selectedCustomerPersona;
    const selectedAdvisorPersona = metadata?.selectedAdvisorPersona;

    const activeSessionId = sessionId || (await createSession(validatedUserId));
    await addMessage(activeSessionId, "user", message, metadata);

    // Build CRM context automatically
    let crmContext = "";
    if (selectedCustomerPersona) {
      try {
        const customer = await getCustomerByNumber(selectedCustomerPersona);
        if (customer) {
          const hasAccess = await this.verifyCustomerAccess(
            validatedUserId,
            customer.id
          );
          if (hasAccess) {
            const policies = await getCustomerPolicies(customer.id);
            const claims = await getCustomerClaims(customer.id);
            crmContext = `Customer Context: ${customer.first_name} ${customer.last_name} (${customer.customer_number}), ${customer.segment} segment, ${policies.length} active policies, ${claims.length} claims. `;
          }
        }
      } catch (error) {
        console.error("Failed to load customer context:", error);
      }
    } else if (selectedAdvisorPersona) {
      try {
        const advisor = await getAdvisorByNumber(selectedAdvisorPersona);
        if (advisor) {
          const hasAccess = await this.verifyAdvisorAccess(
            validatedUserId,
            advisor.id
          );
          if (hasAccess) {
            const clients = await getAdvisorClients(advisor.id);
            crmContext = `Advisor Context: ${advisor.first_name} ${advisor.last_name} (${advisor.advisor_number}), ${advisor.specialization} specialist, ${clients.length} active clients. `;
          }
        }
      } catch (error) {
        console.error("Failed to load advisor context:", error);
      }
    }

    const history = await getSessionMessages(activeSessionId, 10);
    const searchResults = await this.performSearch(
      message,
      selectedCustomerPersona,
      selectedAdvisorPersona
    );
    const context = this.buildContext(searchResults, crmContext);

    const messages: Array<{
      role: "user" | "assistant" | "system";
      content: string;
    }> = [
      { role: "system", content: this.getSystemPrompt() },
      ...(crmContext
        ? [{ role: "system", content: crmContext } as const]
        : []),
      { role: "system", content: `Relevant context:\n${context}` },
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const stream = await this.llm.streamChat(messages);

    return {
      stream,
      sessionId: activeSessionId,
      sources: searchResults.sources,
      toolsUsed: searchResults.toolsUsed,
    };
  }
}

// Factory function
export function createAgent(dependencies: AgentDependencies) {
  return new LifeCompassAgent(dependencies);
}
