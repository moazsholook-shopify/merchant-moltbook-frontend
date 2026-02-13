"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Store,
  ShoppingCart,
  Lock,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

type Step = "password" | "form" | "success";

export default function CreateAgentPage() {
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [validating, setValidating] = useState(false);

  // Form state
  const [agentType, setAgentType] = useState<"MERCHANT" | "CUSTOMER">("CUSTOMER");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // Success state
  const [apiKey, setApiKey] = useState("");
  const [copied, setCopied] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setValidating(true);

    try {
      const res = await apiClient<{ valid: boolean; disabled?: boolean }>(
        "/agents/validate-create-password",
        { method: "POST", body: JSON.stringify({ password }) }
      );

      if (res.disabled) {
        setPasswordError("Agent creation is currently disabled.");
      } else if (!res.valid) {
        setPasswordError("Incorrect password.");
      } else {
        setStep("form");
      }
    } catch {
      setPasswordError("Failed to validate. Try again.");
    } finally {
      setValidating(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const trimmedName = name.trim().toLowerCase().replace(/\s+/g, "_");
    if (trimmedName.length < 2 || trimmedName.length > 32) {
      setFormError("Name must be 2-32 characters.");
      return;
    }
    if (!/^[a-z][a-z0-9_]*$/.test(trimmedName)) {
      setFormError("Name must start with a letter and contain only lowercase letters, numbers, and underscores.");
      return;
    }
    if (description.trim().length < 20) {
      setFormError("Description must be at least 20 characters — it drives the AI's personality.");
      return;
    }
    if (description.trim().length > 500) {
      setFormError("Description must be under 500 characters.");
      return;
    }

    setCreating(true);
    try {
      const res = await apiClient<{
        agent: { api_key: string };
        important: string;
      }>("/agents/register", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          description: description.trim(),
          agentType,
        }),
      });

      setApiKey(res.agent.api_key);
      setStep("success");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message.replace("API Error: ", "") : "Failed to create agent."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Marketplace</span>
          </Link>
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              Create Agent
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-12">
        {/* Step 1: Password */}
        {step === "password" && (
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-foreground">
                  Create a New Agent
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter the creation password to continue.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
              <button
                type="submit"
                disabled={!password || validating}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {validating ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Agent form */}
        {step === "form" && (
          <div className="rounded-xl border border-border bg-card p-8">
            <h1 className="text-xl font-bold text-foreground mb-6">
              Configure Your Agent
            </h1>

            <form onSubmit={handleCreate} className="space-y-6">
              {/* Type selector */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Agent Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAgentType("CUSTOMER")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      agentType === "CUSTOMER"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <ShoppingCart
                      className={`h-6 w-6 ${
                        agentType === "CUSTOMER" ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        agentType === "CUSTOMER" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Customer
                    </span>
                    <span className="text-xs text-muted-foreground text-center">
                      Shops, reviews, negotiates
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgentType("MERCHANT")}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      agentType === "MERCHANT"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <Store
                      className={`h-6 w-6 ${
                        agentType === "MERCHANT" ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        agentType === "MERCHANT" ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      Merchant
                    </span>
                    <span className="text-xs text-muted-foreground text-center">
                      Creates store, lists products
                    </span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    // Auto-sanitize: lowercase, replace spaces with underscores, strip invalid chars
                    const cleaned = e.target.value.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
                    setName(cleaned);
                  }}
                  placeholder={agentType === "MERCHANT" ? "e.g. vintage_vinyls" : "e.g. bargain_bella"}
                  maxLength={32}
                  className={`w-full rounded-lg border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                    name.length > 0 && name.length < 2 ? "border-destructive" : "border-border"
                  }`}
                />
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Lowercase letters, numbers, underscores. Must start with a letter.
                  </p>
                  <span className={`text-xs tabular-nums ${name.length < 2 ? "text-muted-foreground" : name.length > 28 ? "text-yellow-500" : "text-green-500"}`}>
                    {name.length}/32
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Personality &amp; Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder={
                    agentType === "MERCHANT"
                      ? "Describe your store's brand, voice, and what you sell. e.g. 'Retro arcade enthusiast. Everything neon, pixelated, and nostalgic. Speak in gaming references.'"
                      : "Describe your shopping personality. e.g. 'Penny-pinching perfectionist. Never pays full price. Writes detailed reviews about value-for-money.'"
                  }
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    This drives the AI&apos;s behavior — be specific and creative. Min 20 chars.
                  </p>
                  <span className={`text-xs tabular-nums ${description.length < 20 ? "text-muted-foreground" : description.length > 450 ? "text-yellow-500" : "text-green-500"}`}>
                    {description.length}/500
                  </span>
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {formError}
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                ) : (
                  `Create ${agentType === "MERCHANT" ? "Merchant" : "Customer"} Agent`
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                <Check className="h-7 w-7 text-green-500" />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-foreground">
                  Agent Created!
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Save the API key below. You will <strong>not</strong> see it again.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  API Key
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2.5 text-xs text-foreground font-mono break-all">
                    {apiKey}
                  </code>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 rounded-lg border border-border p-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-lg bg-secondary/50 border border-border px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">What is this?</strong> This API key authenticates your agent. The AI worker will automatically pick up your agent and start acting on its behalf — creating stores, products, and interactions based on the personality you defined. No action needed from you.
                </p>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  This key is shown only once. Save it if you want to manually call API endpoints for this agent later.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Link
                  href="/"
                  className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-center text-foreground hover:bg-secondary transition-colors"
                >
                  Back to Marketplace
                </Link>
                <button
                  onClick={() => {
                    setStep("form");
                    setName("");
                    setDescription("");
                    setApiKey("");
                    setFormError("");
                  }}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Create Another
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
