/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createAssistant } from "@/action/vapi";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const CreateAssistantModal = ({ isOpen, onClose, userId }: Props) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [useDefaultAgent, setUseDefaultAgent] = useState(true);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🚀 Starting AI agent creation process...", {
      agentName: name,
      userId,
      useDefaultAgent,
      timestamp: new Date().toISOString()
    });
    
    setLoading(true);
    try {
      console.log("📤 Sending request to create assistant...");
      const res = await createAssistant(name, userId, useDefaultAgent);
      
      console.log("📥 Received response from createAssistant:", {
        success: res.success,
        status: res.status,
        data: res.data,
        timestamp: new Date().toISOString()
      });

      if (!res.success) {
        console.error("❌ Assistant creation failed:", {
          error: res.message,
          timestamp: new Date().toISOString()
        });
        throw new Error(res.message);
      }

      console.log("✅ Assistant created successfully:", {
        assistantId: res.data?.id,
        assistantName: res.data?.name,
        timestamp: new Date().toISOString()
      });

      router.refresh();
      setName("");
      onClose();
      toast.success("Assistant created successfully");
    } catch (error) {
      console.error("🔴 Error in handleSubmit:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      toast.error("Failed to create assistant");
    } finally {
      console.log("🏁 Finishing AI agent creation process", {
        success: !loading,
        timestamp: new Date().toISOString()
      });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-muted/80 rounded-lg w-full max-w-md p-6 border border-input shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Create Assistant</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block font-medium mb-2">Assistant Name</label>
            <Input
              value={name}
              onChange={(e) => {
                console.log("📝 Assistant name changed:", {
                  newValue: e.target.value,
                  timestamp: new Date().toISOString()
                });
                setName(e.target.value);
              }}
              placeholder="Enter assistant name"
              className="bg-neutral-800 border-neutral-700"
              required
            />
            <p className="text-xs text-neutral-400 mt-2">
              This name will be used to identify your assistant.
            </p>
          </div>

          <div className="flex items-center space-x-2 mb-6">
            <Switch
              id="default-agent"
              checked={useDefaultAgent}
              onCheckedChange={(checked) => {
                console.log("🔄 Default agent setting changed:", {
                  newValue: checked,
                  timestamp: new Date().toISOString()
                });
                setUseDefaultAgent(checked);
              }}
            />
            <Label htmlFor="default-agent">Use default brand campaign agent</Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Assistant"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAssistantModal;
