import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import ErrorBoundary from './ErrorBoundary';

global.IS_REACT_ACT_ENVIRONMENT = true;

let shouldThrow;
const Bomb = () => {
  if (shouldThrow) throw new Error('boom');
  return <p>정상 화면</p>;
};

test('렌더링 오류 시 안내와 다시 시도 버튼을 보여 주고, 누르면 복구한다', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  const container = document.createElement('div');
  const root = createRoot(container);
  shouldThrow = true;
  await act(async () => { root.render(<ErrorBoundary><Bomb /></ErrorBoundary>); });
  expect(container.textContent).toContain('불러오지 못했어요.');
  const retry = [...container.querySelectorAll('button')].find((b) => b.textContent.includes('다시 시도'));
  expect(retry).toBeTruthy();
  shouldThrow = false;
  await act(async () => { retry.click(); });
  expect(container.textContent).toContain('정상 화면');
  await act(async () => { root.unmount(); });
  jest.restoreAllMocks();
});

test('오류가 없으면 children을 그대로 렌더링한다', async () => {
  const container = document.createElement('div');
  const root = createRoot(container);
  shouldThrow = false;
  await act(async () => { root.render(<ErrorBoundary><Bomb /></ErrorBoundary>); });
  expect(container.textContent).toBe('정상 화면');
  await act(async () => { root.unmount(); });
});
