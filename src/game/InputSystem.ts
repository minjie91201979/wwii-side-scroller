import type { InputState } from './types';

/**
 * 键盘输入系统。
 * 仅负责"采集"按键状态，不驱动任何游戏逻辑（逻辑由 GameEngine 在循环中消费）。
 */
export class InputSystem {
  private keys = new Set<string>();
  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code);
  };
  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  attach() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  detach() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.keys.clear();
  }

  private isDown(code: string) {
    return this.keys.has(code);
  }

  /** 生成本帧输入快照 */
  snapshot(): InputState {
    return {
      left: this.isDown('ArrowLeft') || this.isDown('KeyA'),
      right: this.isDown('ArrowRight') || this.isDown('KeyD'),
      up: this.isDown('ArrowUp') || this.isDown('KeyW'),
      down: this.isDown('ArrowDown') || this.isDown('KeyS'),
      jump: this.isDown('Space'),
      fire: this.isDown('KeyJ') || this.isDown('KeyK'),
    };
  }
}
