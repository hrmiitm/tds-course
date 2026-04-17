import React, { useEffect } from 'react';
import ChatPanel from '@site/src/components/ChatPanel';
import CodePanel from '@site/src/components/CodePanel';

// SVG icons as inline strings for the TOC toggle button
const PANEL_RIGHT_OPEN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="15" x2="15" y1="3" y2="21"/></svg>`;
const PANEL_RIGHT_CLOSE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="15" x2="15" y1="3" y2="21"/><line x1="9" x2="9" y1="9" y2="15"/><line x1="12" x2="12" y1="9" y2="15"/></svg>`;

const TERMINAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16"/><path d="M4 19h16"/><path d="M6 9l3 3-3 3"/><path d="M11 15h7"/></svg>`;
const CHAT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>`;

// Swizzled Root component — adds resizable left sidebar + optional TOC toggle
export default function Root({ children }: { children: React.ReactNode }): React.JSX.Element {
  useEffect(() => {
    // ===== 1. Restore sidebar width from localStorage =====
    try {
      const savedWidth = localStorage.getItem('tds_sidebar_width');
      if (savedWidth) {
        const w = parseInt(savedWidth, 10);
        if (w >= 200 && w <= 450) {
          document.documentElement.style.setProperty('--doc-sidebar-width', `${w}px`);
        }
      }
    } catch {
      // ignore
    }

    // ===== 2. Restore TOC visibility from localStorage =====
    try {
      const tocVisible = localStorage.getItem('tds_toc_visible');
      if (tocVisible === 'false') {
        document.body.classList.add('toc-hidden');
      }
    } catch {
      // ignore
    }

    // ===== 3. Sidebar resize handle =====
    const addResizeHandle = () => {
      const sidebar = document.querySelector('.theme-doc-sidebar-container') as HTMLElement | null;
      if (!sidebar || sidebar.querySelector('.sidebar-resize-handle')) return;

      sidebar.style.position = 'relative';

      const handle = document.createElement('div');
      handle.className = 'sidebar-resize-handle';
      sidebar.appendChild(handle);

      let isResizing = false;
      let startX = 0;
      let startWidth = 0;

      const onMouseDown = (e: MouseEvent) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = sidebar.offsetWidth;
        handle.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isResizing) return;
        const diff = e.clientX - startX;
        const newWidth = Math.max(200, Math.min(450, startWidth + diff));
        document.documentElement.style.setProperty('--doc-sidebar-width', `${newWidth}px`);
      };

      const onMouseUp = () => {
        if (!isResizing) return;
        isResizing = false;
        handle.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        try {
          localStorage.setItem('tds_sidebar_width', sidebar.offsetWidth.toString());
        } catch {
          // ignore
        }
      };

      handle.addEventListener('mousedown', onMouseDown);
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      // Store cleanup refs on the handle element
      (handle as any).__cleanup = () => {
        handle.removeEventListener('mousedown', onMouseDown);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };
    };

    // ===== 4. Chat + Terminal buttons in navbar =====
    const addPanelToggles = () => {
      const navbarRight = document.querySelector('.navbar__items--right');
      if (!navbarRight) return;

      const anchor =
        (navbarRight.querySelector('.toc-toggle-btn') as HTMLElement | null) ||
        (navbarRight.querySelector('a[href*="github"]') as HTMLElement | null) ||
        null;

      const ensureBtn = (key: 'chat' | 'terminal', svg: string, label: string, eventName: string) => {
        const cls = `tds-panel-toggle-btn tds-${key}-toggle-btn clean-btn`;
        if (document.querySelector(`.tds-${key}-toggle-btn`)) return;

        const btn = document.createElement('button');
        btn.className = cls;
        btn.title = label;
        btn.setAttribute('aria-label', label);
        btn.innerHTML = svg;
        btn.addEventListener('click', () => {
          window.dispatchEvent(new Event(eventName));
        });

        if (anchor) {
          navbarRight.insertBefore(btn, anchor);
        } else {
          navbarRight.appendChild(btn);
        }
      };

      // Order: chat, terminal
      ensureBtn('chat', CHAT_SVG, 'Toggle assistant chat', 'tds:toggle-chat');
      ensureBtn('terminal', TERMINAL_SVG, 'Toggle terminal', 'tds:toggle-terminal');
    };

    // ===== 5. TOC toggle button in navbar =====
    const addTocToggle = () => {
      const navbarRight = document.querySelector('.navbar__items--right');
      if (!navbarRight || document.querySelector('.toc-toggle-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'toc-toggle-btn clean-btn';
      btn.title = 'Toggle Table of Contents';
      btn.setAttribute('aria-label', 'Toggle Table of Contents');

      const isHidden = document.body.classList.contains('toc-hidden');
      btn.innerHTML = isHidden ? PANEL_RIGHT_CLOSE_SVG : PANEL_RIGHT_OPEN_SVG;

      btn.addEventListener('click', () => {
        document.body.classList.toggle('toc-hidden');
        const nowHidden = document.body.classList.contains('toc-hidden');
        try {
          localStorage.setItem('tds_toc_visible', (!nowHidden).toString());
        } catch {
          // ignore
        }
        btn.innerHTML = nowHidden ? PANEL_RIGHT_CLOSE_SVG : PANEL_RIGHT_OPEN_SVG;
      });

      // Insert before the GitHub link if present, otherwise append
      const githubLink = navbarRight.querySelector('a[href*="github"]');
      if (githubLink) {
        navbarRight.insertBefore(btn, githubLink);
      } else {
        navbarRight.appendChild(btn);
      }
    };

    // ===== 6. Initialize =====
    addResizeHandle();
    addPanelToggles();
    addTocToggle();

    // Re-run on DOM changes (Docusaurus SPA navigation remounts components)
    const observer = new MutationObserver(() => {
      addResizeHandle();
      addPanelToggles();
      addTocToggle();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      // Clean up resize event listeners
      document.querySelectorAll('.sidebar-resize-handle').forEach((handle) => {
        if ((handle as any).__cleanup) {
          (handle as any).__cleanup();
        }
      });
    };
  }, []);

  return (
    <>
      {children}
      <CodePanel />
      <ChatPanel />
    </>
  );
}
