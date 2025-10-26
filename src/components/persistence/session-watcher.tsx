'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { pause } from '@/lib/slices/interviewSlice';
import type { RootState } from '@/lib/store';

export default function SessionWatcher() {
  const dispatch = useDispatch();
  const status = useSelector((s: RootState) => s.interview.status);

  useEffect(() => {
    const handleHide = () => {
      if (document.hidden && status === 'running') {
        dispatch(pause());
      }
    };
    document.addEventListener('visibilitychange', handleHide);
    window.addEventListener('pagehide', handleHide);
    return () => {
      document.removeEventListener('visibilitychange', handleHide);
      window.removeEventListener('pagehide', handleHide);
    };
  }, [dispatch, status]);

  return null;
}
