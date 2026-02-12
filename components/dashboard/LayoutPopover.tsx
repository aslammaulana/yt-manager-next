"use client";

import React, { useState, useRef, useEffect } from 'react';
import { LayoutTemplate, Table, LayoutGrid } from "lucide-react";

interface LayoutPopoverProps {
    currentLayout: 'table' | 'grid';
    onApply: (layout: 'table' | 'grid') => void;
}

const LayoutPopover: React.FC<LayoutPopoverProps> = ({ currentLayout, onApply }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLayout, setSelectedLayout] = useState<'table' | 'grid'>(currentLayout);
    const popoverRef = useRef<HTMLDivElement>(null);

    const togglePopover = () => {
        if (!isOpen) {
            // Reset selection when opening
            setSelectedLayout(currentLayout);
        }
        setIsOpen(!isOpen);
    };

    const handleApply = () => {
        onApply(selectedLayout);
        setIsOpen(false);
    };

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={popoverRef}>
            <button
                onClick={togglePopover}
                className="hidden md:flex px-5 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all bg-[#155dfc] text-white hover:bg-[#155dfc]/90 text-[14px]"
            >
                <LayoutTemplate size={16} /> <span className="">Layout</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-popover border border-border rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-border">
                        <h3 className="font-semibold text-sm">Pilih Layout</h3>
                    </div>

                    <div className="p-4 flex gap-4">
                        <label className={`flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all w-1/2 ${selectedLayout === 'table' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'}`}>
                            <input
                                type="radio"
                                name="layout"
                                value="table"
                                checked={selectedLayout === 'table'}
                                onChange={() => setSelectedLayout('table')}
                                className="sr-only"
                            />
                            <Table size={24} className={selectedLayout === 'table' ? 'text-primary' : 'text-muted-foreground'} />
                            <span className={`text-xs font-medium ${selectedLayout === 'table' ? 'text-primary' : 'text-muted-foreground'}`}>Table</span>
                        </label>

                        <label className={`flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all w-1/2 ${selectedLayout === 'grid' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent'}`}>
                            <input
                                type="radio"
                                name="layout"
                                value="grid"
                                checked={selectedLayout === 'grid'}
                                onChange={() => setSelectedLayout('grid')}
                                className="sr-only"
                            />
                            <LayoutGrid size={24} className={selectedLayout === 'grid' ? 'text-primary' : 'text-muted-foreground'} />
                            <span className={`text-xs font-medium ${selectedLayout === 'grid' ? 'text-primary' : 'text-muted-foreground'}`}>Grid</span>
                        </label>
                    </div>

                    <div className="p-3 bg-muted/30 border-t border-border flex justify-end gap-2 rounded-b-lg">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors cursor-pointer"
                        >
                            Terapkan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LayoutPopover;
