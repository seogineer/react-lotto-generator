import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import axios from 'axios';
import AsyncState from './AsyncState';
import LatestDraw from './LatestDraw';
import WinningNumbers from './WinningNumbers';
import App from '../App';

jest.mock('axios', () => ({ __esModule: true, default: { get: jest.fn() } }));
global.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;
const mount = async (el) => { await act(async () => { root.render(el); }); };

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  container = document.createElement('div');
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => { root.unmount(); });
  jest.restoreAllMocks();
  axios.get.mockReset();
});

describe('AsyncState', () => {
  test('데이터가 없고 로딩/에러도 아니면 빈 상태 문구를 보여 준다', async () => {
    await mount(<AsyncState loading={false} error={null} hasData={false}>x</AsyncState>);
    expect(container.textContent).toContain('아직 표시할 회차가 없어요');
  });
  test('에러면 오류 문구, 데이터가 있으면 children', async () => {
    await mount(<AsyncState loading={false} error={new Error('e')} hasData={false} onRetry={() => {}}>x</AsyncState>);
    expect(container.textContent).toContain('데이터를 불러오지 못했어요.');
    await mount(<AsyncState loading={false} error={new Error('e')} hasData onRetry={() => {}}>자식</AsyncState>);
    expect(container.textContent).toBe('자식');
  });
});

const BAD_RESPONSES = [
  ['null', null],
  ['빈 문자열(HTML 오류 페이지 등)', ''],
  ['content 없음', {}],
  ['content 빈 배열', { content: [] }],
  ['content가 배열이 아님', { content: 'x', totalPages: 'abc' }],
  ['필드 누락', { content: [{ round: 1 }], totalPages: 1 }],
  ['필드 타입 이상', { content: [{ round: 1, date: 20240101, one: 'a', bonus: null, firstWinPrize: 'x', firstWinners: {} }], totalPages: null }],
];

describe.each(BAD_RESPONSES)('비정상 응답: %s', (_name, data) => {
  test('LatestDraw가 크래시하지 않는다', async () => {
    axios.get.mockResolvedValue({ data });
    await mount(<LatestDraw />);
    expect(container.textContent).toContain('최신 회차 번호');
  });
  test('WinningNumbers가 크래시하지 않는다', async () => {
    axios.get.mockResolvedValue({ data });
    await mount(<WinningNumbers />);
    expect(container.textContent).toContain('회차별 기록');
  });
  test('App 전체가 빈 화면이 되지 않는다', async () => {
    axios.get.mockResolvedValue({ data });
    await mount(<App />);
    expect(container.textContent).toContain('번호 생성하기');
    expect(container.textContent).not.toContain('화면 렌더링 실패');
  });
});

test('요청 실패 시 오류 문구와 다시 시도가 표시되고, useFetch는 timeout 8000을 쓴다', async () => {
  axios.get.mockRejectedValue(new Error('network'));
  await mount(<LatestDraw />);
  expect(container.textContent).toContain('데이터를 불러오지 못했어요.');
  expect(container.textContent).toContain('다시 시도');
  expect(axios.get.mock.calls[0][1]).toEqual({ timeout: 8000 });
});

test('정상 응답이면 회차 번호를 보여 준다', async () => {
  axios.get.mockResolvedValue({ data: { content: [{ round: 1100, date: '2024-01-06', one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, bonus: 7, firstWinPrize: 1000, firstWinners: 3 }] } });
  await mount(<LatestDraw />);
  expect(container.textContent).toContain('1100회');
  expect(container.textContent).toContain('1,000원');
});

test('content가 빈 배열이면 빈 상태 문구를 보여 준다', async () => {
  axios.get.mockResolvedValue({ data: { content: [], totalPages: 0 } });
  await mount(<WinningNumbers />);
  expect(container.textContent).toContain('아직 표시할 회차가 없어요');
});

test('문자열 숫자도 천 단위 구분으로 보여 준다', async () => {
  axios.get.mockResolvedValue({ data: { content: [{ round: 1, date: '2024-01-06', one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, bonus: 7, firstWinPrize: '1234567', firstWinners: 3 }] } });
  await mount(<LatestDraw />);
  expect(container.textContent).toContain('1,234,567원');
});
