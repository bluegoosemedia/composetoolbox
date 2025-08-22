"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertTriangle, Info, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { ValidationResult } from "./utils/validator"

interface ValidationOverviewProps {
  validation: ValidationResult
  onGoToLine?: (line: number) => void
}

export function ValidationOverview({ validation, onGoToLine }: ValidationOverviewProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getStatusIcon = () => {
    if (validation.hasErrors) {
      return <XCircle className="w-5 h-5 text-red-500" />
    } else if (validation.hasWarnings) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />
    } else {
      return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  const getStatusText = () => {
    if (validation.hasErrors) {
      return "Invalid Configuration"
    } else if (validation.hasWarnings) {
      return "Valid with Warnings"
    } else {
      return "Valid Configuration"
    }
  }

  const getStatusColor = () => {
    if (validation.hasErrors) {
      return "text-red-500"
    } else if (validation.hasWarnings) {
      return "text-yellow-500"
    } else {
      return "text-green-500"
    }
  }

  const errorCount = validation.issues.filter((issue) => issue.type === "error").length
  const warningCount = validation.issues.filter((issue) => issue.type === "warning").length
  const infoCount = validation.issues.filter((issue) => issue.type === "info").length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            <span className={getStatusColor()}>Validation</span>
          </CardTitle>
          {validation.issues.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)} className="text-xs h-7">
              {showDetails ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {showDetails ? "Hide" : "Show"} Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Summary */}
        <div className="flex items-center justify-between">
          <span className={`font-medium ${getStatusColor()}`}>{getStatusText()}</span>
          <div className="flex items-center gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {errorCount} Error{errorCount !== 1 ? "s" : ""}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                {warningCount} Warning{warningCount !== 1 ? "s" : ""}
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-600">
                {infoCount} Suggestion{infoCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Summary for Valid Configs */}
        {validation.isValid && !validation.hasWarnings && (
          <div className="text-sm text-muted-foreground">
            ✅ Your Docker Compose configuration is valid and follows best practices!
          </div>
        )}

        {/* Issue Details */}
        {showDetails && validation.issues.length > 0 && (
          <div className="space-y-2 mt-4">
            {validation.issues.map((issue, index) => (
              <Alert
                key={index}
                className={`text-xs ${
                  issue.type === "error"
                    ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                    : issue.type === "warning"
                      ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950"
                      : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                }`}
              >
                <div className="flex items-start gap-2">
                  {issue.type === "error" ? (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : issue.type === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <AlertDescription className="text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="flex-1">{issue.message}</span>
                        {issue.line && onGoToLine && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onGoToLine(issue.line!)}
                            className="h-5 px-2 text-xs shrink-0"
                          >
                            Line {issue.line}
                          </Button>
                        )}
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
