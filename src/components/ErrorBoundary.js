import React from 'react';
import { RefreshCw } from 'lucide-react';

// 렌더링 중 오류가 나도 화면 전체가 비지 않도록 막고, 다시 시도할 수 있게 한다.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
    this.reset = () => this.setState({ failed: false });
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('화면 렌더링 실패:', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="text-center py-6" role="alert">
        <p className="text-body mb-3">불러오지 못했어요.</p>
        <button
          onClick={this.reset}
          className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-full border border-line-strong text-accent-strong hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          다시 시도
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
