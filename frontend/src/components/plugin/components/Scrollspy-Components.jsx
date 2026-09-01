import React, { useRef } from "react";
import { Scrollspy } from "../../reui/scrollspy";

export function Pattern() {
  const parentRef = useRef(null);

  const nav = [
    {
      id: "section-1",
      label: "Section 1",
    },
    {
      id: "section-2",
      label: "Section 2",
    },
    {
      id: "section-3",
      label: "Section 3",
    },
    {
      id: "section-4",
      label: "Section 4",
    },
    {
      id: "section-5",
      label: "Section 5",
    },
  ];

  return (
    <div className="flex w-full grow gap-5">
      <div className="flex w-[150px] flex-col gap-2">
        <Scrollspy
          offset={50}
          targetRef={parentRef}
          className="flex flex-col gap-2.5"
        >
          {nav.map((item) => (
            <button
              key={item.id}
              data-scrollspy-anchor={item.id}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50 h-9 px-4 py-2 data-[active=true]:bg-slate-900 data-[active=true]:text-slate-50 dark:data-[active=true]:bg-slate-50 dark:data-[active=true]:text-slate-900"
            >
              {item.label}
            </button>
          ))}
        </Scrollspy>
      </div>
      <div className="grow">
        <div ref={parentRef} className="overflow-y-auto -me-5 h-[500px] grow pe-5 scroll-smooth relative">
          <div className="space-y-8">
            {nav.map((item) => (
              <div key={item.id} id={item.id} className="space-y-2.5">
                <h3 className="text-foreground text-base font-semibold">{item.label}</h3>
                <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl h-[350px]"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
