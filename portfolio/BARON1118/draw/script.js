import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const channelRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 1. 初始化 Supabase Realtime 頻道
    channelRef.current = supabase.channel('whiteboard-room', {
      config: { broadcast: { self: false } }, // 不發送給自己
    });

    // 2. 監聽遠端繪圖事件
    channelRef.current
      .on('broadcast', { event: 'draw' }, ({ payload }) => {
        drawOnCanvas(payload.x, payload.y, payload.prevX, payload.prevY, payload.color);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelRef.current);
    };
  }, []);

  const drawOnCanvas = (x, y, prevX, prevY, color = '#000') => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.closePath();
  };

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    canvasRef.current.lastX = e.nativeEvent.offsetX;
    canvasRef.current.lastY = e.nativeEvent.offsetY;
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    const prevX = canvasRef.current.lastX;
    const prevY = canvasRef.current.lastY;

    // 本地繪圖
    drawOnCanvas(x, y, prevX, prevY);

    // 廣播給其他用戶
    channelRef.current.send({
      type: 'broadcast',
      event: 'draw',
      payload: { x, y, prevX, prevY, color: '#000' },
    });

    canvasRef.current.lastX = x;
    canvasRef.current.lastY = y;
  };

  const handleMouseUp = () => setIsDrawing(false);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseOut={handleMouseUp}
      className="border border-gray-300 bg-white cursor-crosshair shadow-lg"
    />
  );
}
