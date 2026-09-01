import React, { useEffect, useState, cloneElement, Children, isValidElement, useRef } from "react";

export function Scrollspy({
  offset = 20,
  targetRef,
  className,
  children,
  ...props
}) {
  const [activeId, setActiveId] = useState(null);
  const isClickingRef = useRef(false);
  const clickTimeoutRef = useRef(null);

  // Extract all anchor IDs from children
  const ids = [];
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.props["data-scrollspy-anchor"]) {
      ids.push(child.props["data-scrollspy-anchor"]);
    }
  });

  // Set default active ID on mount
  useEffect(() => {
    if (ids.length > 0 && !activeId) {
      setActiveId(ids[0]);
    }
  }, [ids, activeId]);

  useEffect(() => {
    if (ids.length === 0) return;

    let ticking = false;

    const handleScroll = () => {
      // Don't override activeId while smooth scrolling from a user click
      if (isClickingRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const container = targetRef?.current;
          let currentActive = ids[0];

          if (container) {
            // Check if scrolled near bottom of container
            const isNearBottom =
              container.scrollHeight - container.scrollTop <= container.clientHeight + 40;

            if (isNearBottom) {
              currentActive = ids[ids.length - 1];
            } else {
              const containerRect = container.getBoundingClientRect();

              for (const id of ids) {
                const el = document.getElementById(id);
                if (!el) continue;

                const elRect = el.getBoundingClientRect();
                const relativeTop = elRect.top - containerRect.top;

                // If section top is above or near the offset threshold
                if (relativeTop <= offset + 50) {
                  currentActive = id;
                }
              }
            }
          } else {
            // Window scroll fallback
            const isNearBottom =
              window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40;

            if (isNearBottom) {
              currentActive = ids[ids.length - 1];
            } else {
              for (const id of ids) {
                const el = document.getElementById(id);
                if (!el) continue;

                const elTop = el.getBoundingClientRect().top;
                if (elTop <= offset + 50) {
                  currentActive = id;
                }
              }
            }
          }

          if (currentActive) {
            setActiveId(currentActive);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    const targetElement = targetRef?.current || window;
    targetElement.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      targetElement.removeEventListener("scroll", handleScroll);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, [targetRef, offset, JSON.stringify(ids)]);

  const handleClick = (id) => {
    const el = document.getElementById(id);
    if (!el) return;

    setActiveId(id);
    isClickingRef.current = true;

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    clickTimeoutRef.current = setTimeout(() => {
      isClickingRef.current = false;
    }, 600);

    const container = targetRef?.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const targetScrollTop = container.scrollTop + (elRect.top - containerRect.top) - offset;

      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });
    } else {
      const elTop = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: Math.max(0, elTop),
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={className} {...props}>
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const anchor = child.props["data-scrollspy-anchor"];
        if (anchor) {
          return cloneElement(child, {
            "data-active": activeId === anchor ? "true" : "false",
            onClick: (e) => {
              if (child.props.onClick) child.props.onClick(e);
              handleClick(anchor);
            },
          });
        }
        return child;
      })}
    </div>
  );
}
