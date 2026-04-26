'use client';

export function SidebarHeader() {
  return (
    <div className="flex items-center gap-2.5 border-b border-rule px-4 py-3.5">
      <div className="flex h-[22px] w-[22px] items-center justify-center rounded-[3px] bg-ink">
        <span className="font-serif text-[13px] italic font-semibold leading-none text-paper">
          S
        </span>
      </div>
      <span className="font-serif text-[22px] italic font-semibold leading-none text-ink">
        Smart Notes
      </span>
    </div>
  );
}
