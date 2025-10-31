import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { numEmpleados, rotacionActual, salarioMedio, inversionBienestar } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Eres un experto en bienestar laboral y ROI de políticas de RRHH. Analiza los datos de la empresa y recomienda las 5 políticas más impactantes con datos concretos de implementación y retorno esperado.

IMPORTANTE: Siempre responde en español y usa datos realistas del mercado español.`;

    const userPrompt = `Analiza esta empresa y recomienda las 5 mejores políticas de bienestar:

📊 DATOS DE LA EMPRESA:
- Empleados: ${numEmpleados}
- Rotación anual: ${rotacionActual}%
- Salario medio: €${salarioMedio}
- Presupuesto bienestar: €${inversionBienestar}

Para cada política recomendada, proporciona:
1. Nombre de la política
2. Costo anual estimado (€)
3. Reducción de rotación esperada (%)
4. Aumento de satisfacción esperado (%)
5. ROI estimado a 12 meses (%)
6. Justificación breve (1-2 frases)
7. Prioridad (Alta/Media/Baja)

Considera el tamaño de la empresa y presupuesto disponible. Prioriza políticas con mejor relación coste-beneficio.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_policies",
              description: "Recomienda políticas de bienestar con impacto estimado",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        costAnual: { type: "number" },
                        reduccionRotacion: { type: "number" },
                        aumentoSatisfaccion: { type: "number" },
                        roi: { type: "number" },
                        justificacion: { type: "string" },
                        prioridad: { type: "string", enum: ["Alta", "Media", "Baja"] }
                      },
                      required: ["name", "costAnual", "reduccionRotacion", "aumentoSatisfaccion", "roi", "justificacion", "prioridad"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["recommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "recommend_policies" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de peticiones excedido. Intenta de nuevo en unos momentos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados. Contacta con soporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error("No se recibieron recomendaciones del modelo de IA");
    }

    const recommendations = JSON.parse(toolCall.function.arguments).recommendations;

    return new Response(
      JSON.stringify({ recommendations }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error in ai-policy-recommendations:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Error desconocido al generar recomendaciones" 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
