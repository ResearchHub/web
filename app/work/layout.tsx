import { Suspense } from 'react'

export default function WorkLayout(props: {
  children: React.ReactNode
  loading: React.ReactNode
}) {
  return (
    <Suspense fallback={props.loading}>
      {props.children}
    </Suspense>
  )
} 