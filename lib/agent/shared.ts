// lib/agent/shared.ts
// Agent intelligence and orchestration utilities
// Purpose: Query intent detection, intelligent tool pre-selection, and context building
// Used by: LifeCompassAgent

import {
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
  hybridSearchTool,
  graphSearchTool,
} from "./tools";
import type { ToolCall, ChunkResult, GraphSearchResult } from "./models";

/**
 * Query Intent Detection
 * Detects what the user is asking for to enable intelligent tool selection
 */
export interface QueryIntent {
  isPolicyQuery: boolean;
  isClaimQuery: boolean;
  isDocumentQuery: boolean;
  isTaskQuery: boolean;
  isProfileQuery: boolean;
  isInteractionQuery: boolean;
  isCalculationQuery: boolean;
  isAdvisorQuery: boolean;
}

export function detectQueryIntent(query: string): QueryIntent {
  const queryLower = query.toLowerCase();

  return {
    isPolicyQuery:
      queryLower.includes("policy") || queryLower.includes("policies"),
    isClaimQuery: queryLower.includes("claim") || queryLower.includes("claims"),
    isDocumentQuery:
      queryLower.includes("form") ||
      queryLower.includes("document") ||
      queryLower.includes("guide") ||
      queryLower.includes("pdf"),
    isTaskQuery: queryLower.includes("task") || queryLower.includes("tasks"),
    isProfileQuery:
      queryLower.includes("profile") ||
      queryLower.includes("information") ||
      queryLower.includes("details"),
    isInteractionQuery:
      queryLower.includes("interaction") ||
      queryLower.includes("history") ||
      queryLower.includes("previous"),
    isCalculationQuery:
      queryLower.includes("calculate") ||
      queryLower.includes("compute") ||
      queryLower.includes("work out") ||
      queryLower.includes("what is") ||
      queryLower.includes("how much") ||
      /[\d+\-*/().]/.test(query), // Contains math operators
    isAdvisorQuery:
      queryLower.includes("advisor") ||
      queryLower.includes("adviser") ||
      queryLower.includes("financial advisor") ||
      queryLower.includes("recommend") ||
      queryLower.includes("find an advisor") ||
      queryLower.includes("connect with") ||
      queryLower.includes("assigned advisor"),
  };
}

/**
 * Intelligent Tool Pre-Selection
 * Pre-executes relevant tools based on query intent before LLM call
 * This improves efficiency and reduces unnecessary tool calls
 */
export interface PreSelectedTools {
  crmData: Record<string, any>;
  toolsUsed: ToolCall[];
  sources: ChunkResult[];
}

export async function preSelectTools(
  query: string,
  intent: QueryIntent,
  selectedCustomerPersona?: string,
  selectedAdvisorPersona?: string,
  useVector: boolean = true,
  useGraph: boolean = true,
): Promise<PreSelectedTools> {
  const crmData: Record<string, any> = {};
  const toolsUsed: ToolCall[] = [];
  const sources: ChunkResult[] = [];

  // Customer persona tools
  if (selectedCustomerPersona) {
    try {
      if (intent.isPolicyQuery) {
        const policies = await getCustomerPoliciesTool({
          customerNumber: selectedCustomerPersona,
        });
        crmData.policies = policies;
        toolsUsed.push({
          toolName: "get_customer_policies",
          args: { customerNumber: selectedCustomerPersona },
        });
      }

      if (intent.isClaimQuery) {
        const claims = await getCustomerClaimsTool({
          customerNumber: selectedCustomerPersona,
        });
        crmData.claims = claims;
        toolsUsed.push({
          toolName: "get_customer_claims",
          args: { customerNumber: selectedCustomerPersona },
        });
      }

      if (intent.isInteractionQuery) {
        const interactions = await getCustomerInteractionsTool({
          customerNumber: selectedCustomerPersona,
          limit: 10,
        });
        crmData.interactions = interactions;
        toolsUsed.push({
          toolName: "get_customer_interactions",
          args: { customerNumber: selectedCustomerPersona },
        });
      }

      if (intent.isProfileQuery) {
        const profile = await getCustomerProfileTool({
          customerNumber: selectedCustomerPersona,
        });
        crmData.profile = profile;
        toolsUsed.push({
          toolName: "get_customer_profile",
          args: { customerNumber: selectedCustomerPersona },
        });
      }

      // Advisor recommendation for customers
      if (intent.isAdvisorQuery) {
        // Extract specialization from query if mentioned
        const queryLower = query.toLowerCase();
        let specialization: string | undefined;
        if (
          queryLower.includes("life insurance") ||
          queryLower.includes("life cover")
        ) {
          specialization = "Life Insurance";
        } else if (
          queryLower.includes("investment") ||
          queryLower.includes("retirement")
        ) {
          specialization = "Investment & Retirement";
        } else if (
          queryLower.includes("wealth") ||
          queryLower.includes("financial planning")
        ) {
          specialization = "Wealth Management";
        } else if (queryLower.includes("business")) {
          specialization = "Business Solutions";
        }

        const recommendations = await recommendAdvisorsTool({
          specialization,
          limit: 5,
        });
        crmData.recommendedAdvisors = recommendations;
        toolsUsed.push({
          toolName: "recommend_advisors",
          args: { specialization, limit: 5 },
        });
      }
    } catch (error) {
      console.error("[Shared] CRM tool execution failed:", error);
    }
  }

  // Advisor persona tools
  if (selectedAdvisorPersona) {
    try {
      if (intent.isTaskQuery) {
        const tasks = await getAdvisorTasksTool({
          advisorNumber: selectedAdvisorPersona,
        });
        crmData.tasks = tasks;
        toolsUsed.push({
          toolName: "get_advisor_tasks",
          args: { advisorNumber: selectedAdvisorPersona },
        });
      }

      if (intent.isProfileQuery) {
        const profile = await getAdvisorProfileTool({
          advisorNumber: selectedAdvisorPersona,
        });
        crmData.profile = profile;
        toolsUsed.push({
          toolName: "get_advisor_profile",
          args: { advisorNumber: selectedAdvisorPersona },
        });
      }
    } catch (error) {
      console.error("[Shared] Advisor tool execution failed:", error);
    }
  }

  // Document search (available to all users)
  if (intent.isDocumentQuery) {
    try {
      const documents = await searchDocumentsTool({ query });
      crmData.documents = documents;
      toolsUsed.push({
        toolName: "search_documents",
        args: { query },
      });
    } catch (error) {
      console.error("[Shared] Document search failed:", error);
    }
  }

  // Calculator (available to all users)
  if (intent.isCalculationQuery) {
    try {
      const calcInfo = extractCalculationFromText(query);
      if (calcInfo.hasCalculation && calcInfo.expression) {
        const calcResult = await calculatorTool({
          expression: calcInfo.expression,
          calculationType: calcInfo.calculationType,
          variables: calcInfo.variables,
        });
        crmData.calculation = calcResult;
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
      console.error("[Shared] Calculator tool failed:", error);
    }
  }

  // Knowledge base search (always run for context)
  if (useVector) {
    try {
      const vectorResults = await hybridSearchTool({ query, limit: 5 });
      sources.push(...vectorResults);
      toolsUsed.push({
        toolName: "hybrid_search",
        args: { query, limit: 5 },
      });
    } catch (error) {
      console.error("[Shared] Hybrid search failed:", error);
    }
  }

  // Graph search (always run for context)
  if (useGraph) {
    try {
      // Add timeout to prevent Neo4j from blocking streaming
      const graphResults = await Promise.race([
        graphSearchTool({ query }),
        new Promise<GraphSearchResult[]>(
          (resolve) => setTimeout(() => resolve([]), 3000), // 3 second timeout
        ),
      ]);

      // Convert graph results to sources format for consistency
      if (graphResults && graphResults.length > 0) {
        graphResults.forEach((result) => {
          sources.push({
            chunkId: result.uuid,
            documentId: result.uuid,
            content: result.fact || "",
            score: 0.8, // Graph results have good relevance
            metadata: {
              validAt: result.validAt,
              invalidAt: result.invalidAt,
              sourceNodeUuid: result.sourceNodeUuid,
            },
            documentTitle: "Knowledge Graph",
            documentSource: "neo4j",
          });
        });
      }

      toolsUsed.push({
        toolName: "graph_search",
        args: { query },
      });
    } catch (error) {
      console.error("[Shared] Graph search failed:", error);
      // Continue without graph results - don't block streaming
    }
  }

  return { crmData, toolsUsed, sources };
}

/**
 * Build Context from Pre-Selected Tools
 * Combines CRM data and search results into structured context for LLM
 * IMPORTANT: Uses first-person language for customers, third-person for advisors
 */
export function buildContextFromPreSelected(
  preSelected: PreSelectedTools,
  crmContext?: string,
  isCustomerPersona?: boolean,
): string {
  const contextParts: string[] = [];

  // Add CRM context if available
  if (crmContext) {
    contextParts.push(crmContext);
  }

  // Add explicit instruction about perspective
  if (isCustomerPersona) {
    contextParts.push(
      "CRITICAL: The data below is YOUR OWN data. Always refer to it in first person (e.g., 'You have...', 'Your claims...', 'Your policies...'). Never use third person (e.g., 'Petrus Shikongo has...').",
    );
  }

  // Add CRM data from pre-selected tools
  if (preSelected.crmData) {
    if (preSelected.crmData.policies) {
      const label = isCustomerPersona
        ? "Your Policies:"
        : "Customer Policies:";
      contextParts.push(
        `${label}\n${JSON.stringify(preSelected.crmData.policies, null, 2)}`,
      );
    }
    if (preSelected.crmData.claims) {
      const label = isCustomerPersona ? "Your Claims:" : "Customer Claims:";
      contextParts.push(
        `${label}\n${JSON.stringify(preSelected.crmData.claims, null, 2)}`,
      );
    }
    if (preSelected.crmData.interactions) {
      const label = isCustomerPersona
        ? "Your Interactions:"
        : "Customer Interactions:";
      contextParts.push(
        `${label}\n${JSON.stringify(preSelected.crmData.interactions, null, 2)}`,
      );
    }
    if (preSelected.crmData.tasks) {
      contextParts.push(
        `Advisor Tasks:\n${JSON.stringify(preSelected.crmData.tasks, null, 2)}`,
      );
    }
    if (preSelected.crmData.documents) {
      contextParts.push(
        `Available Documents:\n${JSON.stringify(preSelected.crmData.documents, null, 2)}`,
      );
    }
    if (preSelected.crmData.profile) {
      const label = isCustomerPersona ? "Your Profile:" : "Profile Data:";
      contextParts.push(
        `${label}\n${JSON.stringify(preSelected.crmData.profile, null, 2)}`,
      );
    }
    if (preSelected.crmData.recommendedAdvisors) {
      const label = isCustomerPersona
        ? "Recommended Advisors for You:"
        : "Recommended Advisors:";
      contextParts.push(
        `${label}\n${JSON.stringify(preSelected.crmData.recommendedAdvisors, null, 2)}`,
      );
    }
    if (preSelected.crmData.calculation) {
      const calc = preSelected.crmData.calculation;
      if (calc.error) {
        contextParts.push(`Calculation Error: ${calc.message}`);
      } else {
        contextParts.push(
          `Calculation Result:\nFormula: ${calc.formula}\nResult: ${calc.result}\nType: ${calc.calculationType}`,
        );
      }
    }
  }

  // Add knowledge base sources
  if (preSelected.sources.length > 0) {
    contextParts.push(
      preSelected.sources
        .map(
          (source, idx) =>
            `[Source ${idx + 1}: ${source.documentTitle}]\n${source.content}\n`,
        )
        .join("\n---\n"),
    );
  }

  return contextParts.length > 0
    ? contextParts.join("\n\n---\n\n")
    : "No relevant context found in the knowledge base.";
}
