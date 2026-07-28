import { ImageResponse } from 'next/og'
import { THEME } from '@/lib/theme/colors'

export const alt = 'Amar Gupta — Senior Full Stack Developer'
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
          backgroundColor: THEME.surface[0],
          color: THEME.fg[0],
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '9999px',
              backgroundColor: THEME.accent[400],
            }}
          />
          <div
            style={{
              fontSize: '22px',
              color: THEME.fg[2],
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
              color: THEME.fg[1],
              marginTop: '24px',
              maxWidth: '960px',
              lineHeight: 1.2,
            }}
          >
            Senior Full Stack Developer
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: '24px',
            color: THEME.fg[3],
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
