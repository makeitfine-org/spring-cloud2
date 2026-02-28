import { render, type RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { store } from '../app/store'
import type { ReactNode } from 'react'

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{children}</MemoryRouter>
    </Provider>
  )
}

export function renderWithProviders(ui: ReactNode, options?: RenderOptions) {
  return render(ui, { wrapper: Wrapper, ...options })
}
