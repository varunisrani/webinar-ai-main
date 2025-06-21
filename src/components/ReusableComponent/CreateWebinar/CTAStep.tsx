"use client";

import type React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Search, Bot, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useWebinarStore } from "@/store/useWebinarStore";
import { AiAgents } from "@prisma/client";

type Props = {
  assistants: AiAgents[] | [];
};

const CTAStep = ({ assistants }: Props) => {
  const {
    formData,
    updateCTAField,
    addTag,
    removeTag,
    getStepValidationErrors,
  } = useWebinarStore();

  const { ctaLabel, tags, aiAgent } = formData.cta;

  const errors = getStepValidationErrors("cta");
  const [tagInput, setTagInput] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateCTAField(name as keyof typeof formData.cta, value);
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
      setTagInput("");
    }
  };

  const handleSelectAgent = (value: string) => {
    updateCTAField("aiAgent", value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">AI Negotiation Agent</h2>
        <p className="text-muted-foreground">
          Configure your AI agent to handle brand-creator negotiations
        </p>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="ctaLabel"
          className={errors.ctaLabel ? 'text-red-400' : ''}
        >
          Negotiation Button Label <span className="text-red-400">*</span>
        </Label>
        <Input
          id="ctaLabel"
          name="ctaLabel"
          value={ctaLabel || ''}
          onChange={handleChange}
          placeholder="Start Partnership Discussion"
          className={cn(
            '!bg-background/50 border border-input',
            errors.ctaLabel && 'border-red-400 focus-visible:ring-red-400'
          )}
        />
        {errors.ctaLabel && (
          <p className="text-sm text-red-400">{errors.ctaLabel}</p>
        )}
        <p className="text-xs text-muted-foreground">
          This text will appear on the button that starts the negotiation
        </p>
      </div>

      {/* AI Agent Selection - Required */}
      <div className="space-y-2">
        <Label className={errors.aiAgent ? 'text-red-400' : ''}>
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Select AI Agent <span className="text-red-400">*</span>
          </div>
        </Label>
        <div className="relative">
          <div className="mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search AI agents..."
                className="pl-9 !bg-background/50 border border-input"
              />
            </div>
          </div>

          <Select
            value={aiAgent}
            onValueChange={handleSelectAgent}
          >
            <SelectTrigger className={cn(
              "w-full !bg-background/50 border border-input",
              errors.aiAgent && "border-red-400 focus-visible:ring-red-400"
            )}>
              <SelectValue placeholder="Choose an AI agent for this session" />
            </SelectTrigger>
            <SelectContent className="bg-background border border-input max-h-48">
              {assistants?.length > 0 ? (
                assistants.map((assistant) => (
                  <SelectItem
                    key={assistant.id}
                    value={assistant.id}
                    className="!bg-background/50 hover:!bg-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-500" />
                      {assistant.name}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-agent" disabled>
                  <div className="text-muted-foreground">
                    No AI agents available. Create one first!
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        {errors.aiAgent && (
          <p className="text-sm text-red-400">{errors.aiAgent}</p>
        )}
        <p className="text-xs text-muted-foreground">
          This AI agent will interact with participants during the session
        </p>
      </div>

      {/* Tags for categorization */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Campaign Tags</Label>
        <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border border-input rounded-md bg-background/50">
          <div className="flex items-center gap-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add partnership focus areas..."
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground min-w-[200px]"
            />
          </div>
          {(tags || []).map((tag, index) => (
            <div
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
            >
              <span>{tag}</span>
              <button
                onClick={() => removeTag(tag)}
                className="hover:bg-primary/20 rounded-full p-0.5"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Add relevant tags like "lifestyle", "tech", "fashion", etc. Press Enter to add each tag.
        </p>
      </div>

      {/* AI Session Preview */}
      {aiAgent && (
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-700 dark:text-green-300">
              Negotiation Agent Ready
            </span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400">
            Your AI negotiation agent is configured and ready to facilitate brand-creator discussions!
          </p>
        </div>
      )}
    </div>
  );
};

export default CTAStep;
