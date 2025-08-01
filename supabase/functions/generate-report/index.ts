import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface ReportParams {
  tenant_id: string
  period: string // '7d', '30d', '90d', '1y'
  team_id?: string
  format: 'json' | 'pdf' | 'csv'
  report_type: 'executive' | 'team' | 'detailed'
}

async function getWellnessData(tenantId: string, period: string, teamId?: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  let query = supabase
    .from('checkins')
    .select(`
      *,
      profiles!inner(id, full_name, email, team_id, role)
    `)
    .eq('profiles.tenant_id', tenantId)
    .gte('created_at', startDate.toISOString())

  if (teamId) {
    query = query.eq('profiles.team_id', teamId)
  }

  const { data: checkins } = await query

  // Calculate metrics
  const totalCheckins = checkins?.length || 0
  const avgMood = checkins?.reduce((sum, c) => sum + c.mood, 0) / totalCheckins || 0
  const burnoutRisk = checkins?.filter(c => c.mood <= 2).length || 0
  const burnoutPercentage = totalCheckins > 0 ? (burnoutRisk / totalCheckins) * 100 : 0

  // Get alerts data
  const { data: alerts } = await supabase
    .from('alerts')
    .select(`
      *,
      profiles!inner(id, full_name, team_id)
    `)
    .eq('profiles.tenant_id', tenantId)
    .gte('created_at', startDate.toISOString())

  const criticalAlerts = alerts?.filter(a => a.severity === 'high').length || 0
  const resolvedAlerts = alerts?.filter(a => a.resolved).length || 0
  const alertResolutionRate = alerts?.length ? (resolvedAlerts / alerts.length) * 100 : 0

  // Team breakdown
  const teamStats = checkins?.reduce((acc, checkin) => {
    const teamId = checkin.profiles.team_id
    if (!teamId) return acc

    if (!acc[teamId]) {
      acc[teamId] = {
        checkins: 0,
        totalMood: 0,
        employees: new Set()
      }
    }

    acc[teamId].checkins++
    acc[teamId].totalMood += checkin.mood
    acc[teamId].employees.add(checkin.profiles.id)

    return acc
  }, {} as Record<string, any>) || {}

  const teamBreakdown = Object.entries(teamStats).map(([teamId, stats]) => ({
    team_id: teamId,
    avg_mood: stats.totalMood / stats.checkins,
    total_checkins: stats.checkins,
    unique_employees: stats.employees.size,
    wellness_score: Math.round((stats.totalMood / stats.checkins / 5) * 100)
  }))

  return {
    period,
    total_checkins: totalCheckins,
    avg_mood: Math.round(avgMood * 100) / 100,
    wellness_score: Math.round((avgMood / 5) * 100),
    burnout_risk_percentage: Math.round(burnoutPercentage * 100) / 100,
    total_alerts: alerts?.length || 0,
    critical_alerts: criticalAlerts,
    alert_resolution_rate: Math.round(alertResolutionRate * 100) / 100,
    team_breakdown: teamBreakdown,
    generated_at: new Date().toISOString()
  }
}

async function generateExecutiveReport(params: ReportParams) {
  const wellnessData = await getWellnessData(params.tenant_id, params.period)
  
  // Get tenant info
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('id', params.tenant_id)
    .single()

  // Calculate ROI estimates
  const avgSalary = 45000 // European average
  const turnoverCost = avgSalary * 0.75 // 75% of salary
  const wellnessScore = wellnessData.wellness_score
  const estimatedTurnoverReduction = Math.max(0, (wellnessScore - 50) / 50) * 0.3 // 30% max reduction
  const estimatedCostSavings = estimatedTurnoverReduction * turnoverCost * wellnessData.team_breakdown.length

  return {
    company: tenant?.name || 'Empresa',
    executive_summary: {
      wellness_score: wellnessData.wellness_score,
      risk_level: wellnessData.wellness_score > 70 ? 'Bajo' : wellnessData.wellness_score > 50 ? 'Medio' : 'Alto',
      total_employees_surveyed: wellnessData.team_breakdown.reduce((sum, team) => sum + team.unique_employees, 0),
      response_rate: Math.round((wellnessData.total_checkins / (wellnessData.team_breakdown.length * 30)) * 100), // Estimate
      critical_alerts: wellnessData.critical_alerts
    },
    key_metrics: {
      avg_mood: wellnessData.avg_mood,
      burnout_risk: wellnessData.burnout_risk_percentage,
      alert_resolution_rate: wellnessData.alert_resolution_rate,
      estimated_cost_savings: Math.round(estimatedCostSavings)
    },
    recommendations: generateRecommendations(wellnessData),
    team_breakdown: wellnessData.team_breakdown,
    trends: await getTrendData(params.tenant_id, params.period),
    ...wellnessData
  }
}

async function getTrendData(tenantId: string, period: string) {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const intervals = Math.min(days, 10) // Max 10 data points

  const trendData = []
  for (let i = intervals - 1; i >= 0; i--) {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - (i * Math.floor(days / intervals)))
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - Math.floor(days / intervals))

    const { data: checkins } = await supabase
      .from('checkins')
      .select(`
        mood,
        profiles!inner(tenant_id)
      `)
      .eq('profiles.tenant_id', tenantId)
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString())

    const avgMood = checkins?.length ? checkins.reduce((sum, c) => sum + c.mood, 0) / checkins.length : 0

    trendData.push({
      date: endDate.toISOString().split('T')[0],
      wellness_score: Math.round((avgMood / 5) * 100),
      checkins_count: checkins?.length || 0
    })
  }

  return trendData
}

function generateRecommendations(data: any) {
  const recommendations = []

  if (data.wellness_score < 60) {
    recommendations.push({
      priority: 'high',
      category: 'Intervención Inmediata',
      description: 'El nivel de bienestar general está por debajo del umbral saludable',
      actions: [
        'Implementar sesiones 1:1 con empleados en riesgo',
        'Revisar cargas de trabajo y distribución de tareas',
        'Considerar programas de apoyo psicológico'
      ]
    })
  }

  if (data.burnout_risk_percentage > 25) {
    recommendations.push({
      priority: 'high',
      category: 'Prevención Burnout',
      description: `${data.burnout_risk_percentage}% de empleados muestran signos de riesgo de burnout`,
      actions: [
        'Analizar factores de estrés específicos',
        'Implementar políticas de desconexión digital',
        'Promover equilibrio vida-trabajo'
      ]
    })
  }

  if (data.alert_resolution_rate < 80) {
    recommendations.push({
      priority: 'medium',
      category: 'Gestión de Alertas',
      description: 'Baja tasa de resolución de alertas',
      actions: [
        'Capacitar a managers en detección temprana',
        'Establecer protocolos claros de seguimiento',
        'Implementar sistema de escalado automático'
      ]
    })
  }

  return recommendations
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const params: ReportParams = await req.json()

    console.log('Generating report with params:', params)

    let reportData
    switch (params.report_type) {
      case 'executive':
        reportData = await generateExecutiveReport(params)
        break
      case 'team':
        reportData = await getWellnessData(params.tenant_id, params.period, params.team_id)
        break
      case 'detailed':
        reportData = await generateExecutiveReport(params)
        // Add more detailed data
        break
      default:
        reportData = await getWellnessData(params.tenant_id, params.period)
    }

    // For PDF format, you would integrate with a PDF generation service
    // For now, we'll return structured data that can be used by the frontend
    if (params.format === 'pdf') {
      // In a real implementation, you would generate PDF here
      // For now, return download URL placeholder
      return new Response(JSON.stringify({
        success: true,
        download_url: '/api/reports/download/' + Date.now() + '.pdf',
        data: reportData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      data: reportData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})