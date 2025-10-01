import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvData } = await req.json();

    if (!csvData) {
      throw new Error('Missing CSV data');
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Parse CSV preview (first 10 lines)
    const lines = csvData.split('\n').filter((line: string) => line.trim());
    const preview = lines.slice(0, 11).join('\n'); // header + 10 rows

    const prompt = `Analiza este CSV de empleados y proporciona un análisis detallado en formato JSON:

CSV:
\`\`\`
${preview}
\`\`\`

Proporciona SOLO un objeto JSON válido con esta estructura exacta:
{
  "columnMapping": {
    "detectedColumns": ["lista de columnas detectadas"],
    "suggestions": {
      "columna_original": "columna_estándar_sugerida"
    }
  },
  "dataQuality": {
    "validRows": número,
    "invalidRows": número,
    "issues": [
      {
        "line": número_de_línea,
        "issue": "descripción del problema",
        "suggestion": "sugerencia de corrección"
      }
    ]
  },
  "normalizations": {
    "emails": ["lista de correcciones sugeridas para emails"],
    "roles": ["lista de correcciones sugeridas para roles"],
    "names": ["lista de correcciones sugeridas para nombres"]
  },
  "summary": {
    "totalRows": número,
    "canProceed": true/false,
    "recommendation": "texto descriptivo de recomendación"
  }
}

Reglas de validación:
- Columnas requeridas: full_name, email, role
- Roles válidos: EMPLOYEE, MANAGER, HR_ADMIN
- Emails deben tener formato válido
- Nombres no deben estar vacíos

RESPONDE SOLO CON EL JSON, SIN TEXTO ADICIONAL.`;

    console.log('Calling Gemini API for CSV analysis...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Gemini response:', JSON.stringify(result, null, 2));

    const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Extract JSON from response (remove markdown code blocks if present)
    let analysisText = aiResponse.trim();
    if (analysisText.startsWith('```json')) {
      analysisText = analysisText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (analysisText.startsWith('```')) {
      analysisText = analysisText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', analysisText);
      throw new Error('Invalid JSON response from AI');
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI CSV analysis error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
