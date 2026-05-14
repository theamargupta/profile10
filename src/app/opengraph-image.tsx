import { ImageResponse } from 'next/og'

export const alt = 'Amar Gupta — AI-Powered Full Stack Developer'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          backgroundColor: '#0B0F14',
          color: '#FFFFFF',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '9999px',
              backgroundColor: '#E8A23B',
            }}
          />
          <div
            style={{
              fontSize: '22px',
              color: '#7A8590',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            amargupta.tech
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: '136px',
              fontWeight: 700,
              letterSpacing: '-0.045em',
              lineHeight: 1,
            }}
          >
            Amar Gupta
          </div>
          <div
            style={{
              fontSize: '40px',
              color: '#A6B0BA',
              marginTop: '24px',
              maxWidth: '960px',
              lineHeight: 1.2,
            }}
          >
            AI-Powered Full Stack Developer
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: '24px',
            color: '#5A6675',
            letterSpacing: '0.05em',
          }}
        >
          MCP servers · LLM integration · workflow automation
        </div>
      </div>
    ),
    { ...size },
  )
}
