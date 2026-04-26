import React, { useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Cropper from 'react-easy-crop'
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react'

// Helper: crop the image using canvas and return a base64 data URL
async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  const size = Math.max(pixelCrop.width, pixelCrop.height)
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  )

  return canvas.toDataURL('image/jpeg', 0.9)
}

export default function ImageCropper({ imageSrc, onCropDone, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleDone = async () => {
    if (!croppedAreaPixels) return
    setProcessing(true)
    const result = await getCroppedImg(imageSrc, croppedAreaPixels)
    setProcessing(false)
    onCropDone(result)
  }

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      zIndex: 99999, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#1a1a1a', borderRadius: 16, width: '100%', maxWidth: 520,
        overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #333' }}>
          <div>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: 16, margin: 0 }}>✂️ Crop Image</h3>
            <p style={{ color: '#888', fontSize: 12, margin: '3px 0 0' }}>Drag to reposition · Pinch or scroll to zoom · 1:1 square ratio</p>
          </div>
          <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <X size={16} />
          </button>
        </div>

        {/* Crop Area */}
        <div style={{ position: 'relative', width: '100%', height: 340, background: '#000' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { background: '#111' },
              cropAreaStyle: { border: '2px solid var(--primary, #e84393)' },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, background: '#1a1a1a' }}>
          <ZoomOut size={16} color="#888" />
          <input
            type="range" min={1} max={3} step={0.05}
            value={zoom} onChange={e => setZoom(+e.target.value)}
            style={{ flex: 1, accentColor: '#e84393' }}
          />
          <ZoomIn size={16} color="#888" />
          <span style={{ color: '#888', fontSize: 12, minWidth: 36 }}>{Math.round(zoom * 100)}%</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, padding: '0 20px 20px' }}>
          <button onClick={onCancel}
            style={{ flex: 1, padding: '11px', background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid #333', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
            Cancel
          </button>
          <button onClick={handleDone} disabled={processing}
            style={{ flex: 2, padding: '11px', background: processing ? '#555' : '#e84393', color: '#fff', border: 'none', borderRadius: 8, cursor: processing ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Check size={16} />
            {processing ? 'Processing…' : 'Use Cropped Image'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
