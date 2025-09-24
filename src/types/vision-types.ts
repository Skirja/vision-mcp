export type AnalysisType = "general" | "ui" | "layout" | "components";
export type FrameworkType = "react" | "vue" | "html" | "tailwind";

export interface GeneralAnalysis {
    summary: string;
    mainElements: string[];
    colors?: string[];
    purpose?: string;
}

export interface UIComponent {
    type: string;
    name?: string;
    position?: { x: number; y: number; width?: number; height?: number };
    description?: string;
}

export interface UILayoutDescription {
    framework: FrameworkType;
    structure: string; // e.g., textual layout tree
    notes?: string[];
}

export interface VisualHierarchy {
    hierarchy: Array<{ level: number; element: string; rationale?: string }>;
    colors?: Array<{ name?: string; hex?: string; role?: string }>;
    spacing?: string[];
    typography?: string[];
}

export interface VisionResult {
    type: AnalysisType | "hierarchy" | "layout_description" | "ui_components";
    general?: GeneralAnalysis;
    components?: UIComponent[];
    layout?: UILayoutDescription;
    hierarchy?: VisualHierarchy;
    raw?: string;
}
