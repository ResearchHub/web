'use client'

import { useState } from 'react'
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { toolbarPlugin } from '@react-pdf-viewer/toolbar'
import { scrollModePlugin } from '@react-pdf-viewer/scroll-mode'
import { zoomPlugin } from '@react-pdf-viewer/zoom'

import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import '@react-pdf-viewer/toolbar/lib/styles/index.css'

export const PDFViewer = ({ url }: { url: string }) => {
  // Create the plugins
  const defaultLayoutPluginInstance = defaultLayoutPlugin()
  const toolbarPluginInstance = toolbarPlugin()
  const scrollModePluginInstance = scrollModePlugin()
  const zoomPluginInstance = zoomPlugin()

  return (
    <div className="h-screen bg-gray-100">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <div className="h-full">
          <Viewer
            fileUrl={url}
            plugins={[
              defaultLayoutPluginInstance,
              toolbarPluginInstance,
              scrollModePluginInstance,
              zoomPluginInstance,
            ]}
            defaultScale={SpecialZoomLevel.PageFit}
            theme={{
              theme: 'light',
            }}
          />
        </div>
      </Worker>
    </div>
  )
} 