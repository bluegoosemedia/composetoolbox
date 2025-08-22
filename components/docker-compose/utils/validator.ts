export interface ValidationIssue {
  type: "error" | "warning" | "info"
  message: string
  line?: number
  column?: number
  startLine?: number
  endLine?: number
  startColumn?: number
  endColumn?: number
  code?: string
}

export interface ValidationResult {
  isValid: boolean
  issues: ValidationIssue[]
  hasErrors: boolean
  hasWarnings: boolean
}

export const validateDockerCompose = (yaml: string): ValidationResult => {
  const issues: ValidationIssue[] = []
  const lines = yaml.split("\n")

  // Basic YAML syntax validation
  try {
    // Check for basic YAML structure issues
    validateYamlSyntax(yaml, lines, issues)
  } catch (error) {
    issues.push({
      type: "error",
      message: `YAML syntax error: ${error}`,
      line: 1,
    })
  }

  // Docker Compose specific validation
  validateDockerComposeStructure(yaml, lines, issues)
  validateBestPractices(yaml, lines, issues)
  validateVolumeUsage(yaml, lines, issues)

  // Sort issues by priority (errors → warnings → info) then by line number
  const sortedIssues = issues.sort((a, b) => {
    // First sort by priority
    const priorityOrder = { error: 0, warning: 1, info: 2 }
    const priorityDiff = priorityOrder[a.type] - priorityOrder[b.type]

    if (priorityDiff !== 0) {
      return priorityDiff
    }

    // Then sort by line number (issues without line numbers go to the end)
    const aLine = a.line || Number.MAX_SAFE_INTEGER
    const bLine = b.line || Number.MAX_SAFE_INTEGER
    return aLine - bLine
  })

  const hasErrors = sortedIssues.some((issue) => issue.type === "error")
  const hasWarnings = sortedIssues.some((issue) => issue.type === "warning")

  return {
    isValid: !hasErrors,
    issues: sortedIssues,
    hasErrors,
    hasWarnings,
  }
}

function validateYamlSyntax(yaml: string, lines: string[], issues: ValidationIssue[]) {
  // Check for common YAML syntax issues
  lines.forEach((line, index) => {
    const lineNumber = index + 1
    const trimmed = line.trim()

    // Check for tabs (YAML doesn't allow tabs)
    if (line.includes("\t")) {
      issues.push({
        type: "error",
        message: "YAML does not allow tabs for indentation. Use spaces instead.",
        line: lineNumber,
        code: "yaml-no-tabs",
      })
    }

    // Check for inconsistent indentation
    if (trimmed.length > 0 && !trimmed.startsWith("#")) {
      const leadingSpaces = line.length - line.trimStart().length
      if (leadingSpaces % 2 !== 0 && leadingSpaces > 0) {
        issues.push({
          type: "warning",
          message: "Inconsistent indentation. Docker Compose typically uses 2-space indentation.",
          line: lineNumber,
          code: "yaml-indentation",
        })
      }
    }

    // Check for unclosed quotes
    if (trimmed && !trimmed.startsWith("#")) {
      // Count quotes in the line
      const doubleQuotes = (line.match(/"/g) || []).length
      const singleQuotes = (line.match(/'/g) || []).length

      // Check for odd number of quotes (unclosed quotes)
      if (doubleQuotes % 2 !== 0) {
        issues.push({
          type: "error",
          message: "Unclosed double quote detected. Each opening quote must have a matching closing quote.",
          line: lineNumber,
          code: "yaml-unclosed-quote",
        })
      }

      if (singleQuotes % 2 !== 0) {
        issues.push({
          type: "error",
          message: "Unclosed single quote detected. Each opening quote must have a matching closing quote.",
          line: lineNumber,
          code: "yaml-unclosed-quote",
        })
      }
    }

    // Check for missing spaces after colons
    if (trimmed.includes(":") && !trimmed.startsWith("#")) {
      // Look for colons not followed by space (except at end of line)
      const colonWithoutSpace = /:[^\s]/
      if (colonWithoutSpace.test(trimmed) && !trimmed.endsWith(":")) {
        // Exclude valid cases that don't need spaces after colons:
        // - URLs: http://, https://, tcp://, udp://, ftp://, etc.
        // - Port mappings: "3000:3000", "1194:1194/udp", etc.
        // - Time formats: "12:30", etc.
        // - IPv6 addresses and other colon-separated values
        const isValidColonUsage = 
          trimmed.match(/\w+:\/\//) || // Protocol URLs (http://, tcp://, etc.)
          trimmed.match(/["']?\d+:\d+/) || // Port mappings with or without quotes
          trimmed.match(/\d+:\d+\/\w+/) || // Port mappings with protocol (1194:1194/udp)
          trimmed.match(/^\s*-\s*["']?[\w.-]+:\d+/) || // List items with port mappings
          trimmed.match(/^\s*-\s*["']?[\w.-]+:[\w.-]+/) || // List items with key:value
          trimmed.match(/\w+:\w+/) && !trimmed.match(/^\s*\w+:\s*$/) // General colon-separated values but not YAML keys
        
        if (!isValidColonUsage) {
          // Additional check: only flag if it looks like a YAML key-value pair
          // A YAML key should be at the start of the line (after indentation) and followed by a colon
          const yamlKeyPattern = /^\s*[a-zA-Z_][a-zA-Z0-9_-]*:[^\s]/
          if (yamlKeyPattern.test(line)) {
            issues.push({
              type: "error",
              message: "Missing space after colon. YAML requires a space after colons in key-value pairs.",
              line: lineNumber,
              code: "yaml-missing-space-after-colon",
            })
          }
        }
      }
    }

    // Check for missing colons after keys (improved regex)
    if (
      trimmed &&
      !trimmed.startsWith("#") &&
      !trimmed.startsWith("-") &&
      !trimmed.includes(":") &&
      !trimmed.match(/^\s*$/) &&
      !trimmed.includes("=") && // Exclude environment variables with = syntax
      trimmed.match(/^[a-zA-Z_][a-zA-Z0-9_-]*$/) // Only flag if it looks like a key
    ) {
      issues.push({
        type: "error",
        message: "Missing colon after key. YAML keys must be followed by a colon.",
        line: lineNumber,
        code: "yaml-missing-colon",
      })
    }

    // Check for malformed key-value pairs (like "3.9services:")
    if (trimmed.includes(":") && !trimmed.startsWith("#") && !trimmed.startsWith("-")) {
      const beforeColon = trimmed.split(":")[0]
      // Check if there's text immediately before colon without proper separation
      if (beforeColon.match(/[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$/)) {
        const afterColon = trimmed.split(":")[1] || ""
        // If there's text immediately after the colon without space, it might be malformed
        if (afterColon && !afterColon.startsWith(" ") && !afterColon.startsWith("\t")) {
          // Check if it looks like a malformed version + services combination
          if (beforeColon.match(/["']?[0-9.]+["']?[a-zA-Z]/)) {
            issues.push({
              type: "error",
              message: "Malformed YAML structure. Missing newline or proper spacing between elements.",
              line: lineNumber,
              code: "yaml-malformed-structure",
            })
          }
        }
      }
    }

    // Check for invalid image syntax (trailing colon with no tag)
    if (trimmed.startsWith("image:")) {
      const imageValue = trimmed.substring(6).trim()
      if (imageValue.endsWith(":") && imageValue.length > 1) {
        issues.push({
          type: "error",
          message:
            "Invalid image syntax: image name cannot end with a colon. Either remove the colon or specify a tag.",
          line: lineNumber,
          code: "invalid-image-syntax",
        })
      } else if (imageValue === "") {
        issues.push({
          type: "error",
          message: "Image name cannot be empty",
          line: lineNumber,
          code: "empty-image-name",
        })
      }
    }

    // Check for duplicate keys at the same level
    if (trimmed.includes(":") && !trimmed.startsWith("#")) {
      const key = trimmed.split(":")[0].trim()
      const currentIndent = line.length - line.trimStart().length

      // Look for duplicate keys at the same indentation level
      for (let i = index + 1; i < lines.length; i++) {
        const nextLine = lines[i]
        const nextTrimmed = nextLine.trim()
        const nextIndent = nextLine.length - nextLine.trimStart().length

        if (nextIndent < currentIndent) break // Different level
        if (nextIndent === currentIndent && nextTrimmed.includes(":")) {
          const nextKey = nextTrimmed.split(":")[0].trim()
          if (key === nextKey) {
            issues.push({
              type: "error",
              message: `Duplicate key "${key}" found`,
              line: i + 1,
              code: "yaml-duplicate-key",
            })
          }
        }
      }
    }

    // Check for invalid list item syntax
    if (trimmed.startsWith("-") && !trimmed.startsWith("- ") && trimmed.length > 1) {
      issues.push({
        type: "error",
        message: "Invalid list item syntax. List items must have a space after the dash (- item).",
        line: lineNumber,
        code: "yaml-invalid-list-syntax",
      })
    }

    // Check for mixed indentation styles
    if (line.length > 0 && !trimmed.startsWith("#")) {
      const leadingWhitespace = line.match(/^(\s*)/)?.[1] || ""
      if (leadingWhitespace.includes(" ") && leadingWhitespace.includes("\t")) {
        issues.push({
          type: "error",
          message: "Mixed indentation detected. Use either spaces or tabs consistently (spaces recommended).",
          line: lineNumber,
          code: "yaml-mixed-indentation",
        })
      }
    }
  })

  // Check for overall structure issues
  validateOverallStructure(yaml, lines, issues)
}

function validateOverallStructure(yaml: string, lines: string[], issues: ValidationIssue[]) {
  // Check for completely malformed YAML (like missing newlines between major sections)
  const majorSections = ["version:", "services:", "networks:", "volumes:", "name:"]

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // Check if multiple major sections appear on the same line
    let sectionCount = 0
    const foundSections: string[] = []

    majorSections.forEach((section) => {
      if (trimmed.includes(section)) {
        sectionCount++
        foundSections.push(section.replace(":", ""))
      }
    })

    if (sectionCount > 1) {
      issues.push({
        type: "error",
        message: `Multiple YAML sections found on the same line: ${foundSections.join(", ")}. Each section must be on its own line.`,
        line: index + 1,
        code: "yaml-multiple-sections-same-line",
      })
    }
  })
}

function validateDockerComposeStructure(yaml: string, lines: string[], issues: ValidationIssue[]) {
  // Check for version field and provide info about it being obsolete
  if (yaml.includes("version:")) {
    const versionLineIndex = lines.findIndex((line) => line.trim().startsWith("version:"))
    if (versionLineIndex !== -1) {
      issues.push({
        type: "info",
        message:
          "The 'version' field is now obsolete and optional in Docker Compose v2. You can safely remove it from modern compose files.",
        line: versionLineIndex + 1,
        code: "compose-version-obsolete",
      })
    }
  }

  // Check for improperly nested major sections
  const majorSections = ["services:", "networks:", "volumes:"]
  majorSections.forEach((section) => {
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      // If we find a major section that is indented (not at top level)
      if (trimmed === section && (line.startsWith('  ') || line.startsWith('\t'))) {
        // Special case: volumes: inside a service is valid, only flag top-level volume definitions
        if (section === "volumes:") {
          // Check if this volumes: section contains volume definitions (with driver, etc.)
          // vs just volume mappings (list items starting with -)
          let hasVolumeDefinitions = false
          for (let i = index + 1; i < lines.length; i++) {
            const nextLine = lines[i]
            if (nextLine.trim() === '' || nextLine.startsWith('    ') || nextLine.startsWith('\t\t')) {
              // Check if this looks like a volume definition (has driver, external, etc.)
              if (nextLine.includes('driver:') || nextLine.includes('external:') || 
                  nextLine.includes('driver_opts:') || nextLine.includes('labels:')) {
                hasVolumeDefinitions = true
                break
              }
              // If we see volume mappings (starting with -), this is a service volumes section
              if (nextLine.trim().startsWith('-')) {
                break
              }
            } else {
              break
            }
          }
          
          // Only flag if this appears to be volume definitions, not volume mappings
          if (hasVolumeDefinitions) {
            issues.push({
              type: "error",
              message: `"${section}" section with volume definitions must be at the top level, not nested inside another section`,
              line: index + 1,
              code: "compose-nested-major-section",
            })
          }
        } else {
          // For services: and networks:, they should never be nested
          issues.push({
            type: "error",
            message: `"${section}" section must be at the top level, not nested inside another section`,
            line: index + 1,
            code: "compose-nested-major-section",
          })
        }
      }
    })
  })

  // Check for services section
  if (!yaml.includes("services:")) {
    issues.push({
      type: "error",
      message: "Missing required 'services:' section",
      line: 1,
      code: "compose-missing-services",
    })
    return
  }

  // Find services section (only top-level ones)
  const servicesLineIndex = lines.findIndex((line) => line.trim() === "services:" && !line.startsWith('  ') && !line.startsWith('\t'))
  if (servicesLineIndex === -1) {
    // services: exists but not at top level
    issues.push({
      type: "error",
      message: "services: section found but not at the top level",
      line: 1,
      code: "compose-services-not-top-level",
    })
    return
  }

  // Validate each service
  const serviceNames: string[] = []
  for (let i = servicesLineIndex + 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.match(/^[a-zA-Z]/) && !line.startsWith("  ")) break // End of services section

    if (line.match(/^ {2}[a-zA-Z][a-zA-Z0-9_-]*:\s*$/)) {
      const serviceName = line.trim().replace(":", "")
      serviceNames.push(serviceName)

      // Validate individual service
      validateService(serviceName, i + 1, lines, issues)
    }
  }

  // Check for empty services
  if (serviceNames.length === 0) {
    issues.push({
      type: "error",
      message: "Services section is empty. At least one service is required.",
      line: servicesLineIndex + 1,
      code: "compose-empty-services",
    })
  }
}

function validateService(serviceName: string, startLine: number, lines: string[], issues: ValidationIssue[]) {
  // Find service end
  let endLine = lines.length
  for (let i = startLine; i < lines.length; i++) {
    if (lines[i].match(/^ {2}[a-zA-Z]/) || lines[i].match(/^[a-zA-Z]/)) {
      endLine = i
      break
    }
  }

  const serviceLines = lines.slice(startLine - 1, endLine)
  const serviceConfig = serviceLines.join("\n")

  // Check for image or build
  const hasImage = serviceConfig.includes("image:")
  const hasBuild = serviceConfig.includes("build:")
  if (!hasImage && !hasBuild) {
    issues.push({
      type: "error",
      message: `Service "${serviceName}" must have either "image" or "build" specified`,
      line: startLine,
      code: "service-missing-image-build",
    })
  }

  // Validate image format if present
  if (hasImage) {
    const imageLineIndex = lines.findIndex(
      (line, index) => index >= startLine - 1 && index < endLine && line.trim().startsWith("image:"),
    )
    if (imageLineIndex !== -1) {
      const imageLine = lines[imageLineIndex].trim()
      const imageValue = imageLine.substring(6).trim()

      // Check for various invalid image formats
      if (imageValue.endsWith(":") && imageValue.length > 1) {
        issues.push({
          type: "error",
          message: `Service "${serviceName}" has invalid image format: trailing colon without tag`,
          line: imageLineIndex + 1,
          code: "service-invalid-image-format",
        })
      } else if (imageValue === "") {
        issues.push({
          type: "error",
          message: `Service "${serviceName}" has empty image name`,
          line: imageLineIndex + 1,
          code: "service-empty-image",
        })
      } else if (imageValue.includes("::")) {
        issues.push({
          type: "error",
          message: `Service "${serviceName}" has invalid image format: double colon`,
          line: imageLineIndex + 1,
          code: "service-double-colon-image",
        })
      }
    }
  }

  // Check for restart policy
  if (!serviceConfig.includes("restart:")) {
    issues.push({
      type: "info",
      message: `Service "${serviceName}" has no restart policy. Consider adding "restart: unless-stopped" for production`,
      line: startLine,
      code: "service-missing-restart",
    })
  }

  // Check for volume mappings and validate them
  if (serviceConfig.includes("volumes:")) {
    validateVolumeMappings(serviceName, serviceConfig, startLine, endLine, lines, issues)
  } else {
    issues.push({
      type: "info",
      message: `Service "${serviceName}" has no volume mappings. Did you forget to add persistent storage?`,
      line: startLine,
      code: "service-missing-volumes",
    })
  }

  // Check for exposed ports without port mapping
  if (serviceConfig.includes("expose:") && !serviceConfig.includes("ports:")) {
    issues.push({
      type: "warning",
      message: `Service "${serviceName}" exposes ports but has no port mappings. Ports won't be accessible from host`,
      line: startLine,
      code: "service-exposed-no-ports",
    })
  }

  // Check for environment variables without env_file
  const envCount = (serviceConfig.match(/^\s*-\s+\w+=/gm) || []).length
  if (envCount > 5 && !serviceConfig.includes("env_file:")) {
    // Find the environment section line within this service
    const envLineIndex = lines.findIndex(
      (line, index) => index >= startLine - 1 && index < endLine && line.trim() === "environment:",
    )
    issues.push({
      type: "info",
      message: `Service "${serviceName}" has many environment variables. Consider using env_file for better organization`,
      line: envLineIndex !== -1 ? envLineIndex + 1 : startLine,
      code: "service-many-env-vars",
    })
  }

  // Check for privileged mode
  if (serviceConfig.includes("privileged: true")) {
    // Find the privileged line within this service
    const privilegedLineIndex = lines.findIndex(
      (line, index) => index >= startLine - 1 && index < endLine && line.trim().startsWith("privileged:"),
    )
    issues.push({
      type: "warning",
      message: `Service "${serviceName}" runs in privileged mode. This may be a security risk`,
      line: privilegedLineIndex !== -1 ? privilegedLineIndex + 1 : startLine,
      code: "service-privileged-mode",
    })
  }

  // Check for host network mode
  if (serviceConfig.includes("network_mode: host")) {
    // Find the network_mode line within this service
    const networkModeLineIndex = lines.findIndex(
      (line, index) => index >= startLine - 1 && index < endLine && line.trim().startsWith("network_mode:"),
    )
    issues.push({
      type: "warning",
      message: `Service "${serviceName}" uses host networking. This bypasses Docker's network isolation`,
      line: networkModeLineIndex !== -1 ? networkModeLineIndex + 1 : startLine,
      code: "service-host-network",
    })
  }

  // Validate port mappings
  validatePortMappings(serviceName, serviceConfig, startLine, endLine, lines, issues)
}

function validatePortMappings(
  serviceName: string,
  serviceConfig: string,
  startLine: number,
  endLine: number,
  lines: string[],
  issues: ValidationIssue[],
) {
  const portMatches = serviceConfig.match(/^\s*-\s*["']?(\d+):(\d+)["']?/gm)
  if (!portMatches) return

  const usedPorts: number[] = []

  // Find the ports section line within this service
  const portsLineIndex = lines.findIndex(
    (line, index) => index >= startLine - 1 && index < endLine && line.trim() === "ports:",
  )
  const portsLine = portsLineIndex !== -1 ? portsLineIndex + 1 : startLine

  portMatches.forEach((portMatch) => {
    const match = portMatch.match(/(\d+):(\d+)/)
    if (match) {
      const hostPort = Number.parseInt(match[1])
      const containerPort = Number.parseInt(match[2])

      // Check for duplicate host ports
      if (usedPorts.includes(hostPort)) {
        issues.push({
          type: "error",
          message: `Service "${serviceName}" has duplicate host port ${hostPort}`,
          line: portsLine,
          code: "service-duplicate-port",
        })
      }
      usedPorts.push(hostPort)

      // Check for common port conflicts
      const commonPorts = {
        22: "SSH",
        80: "HTTP",
        443: "HTTPS",
        3306: "MySQL",
        5432: "PostgreSQL",
        6379: "Redis",
        27017: "MongoDB",
      }

      if (commonPorts[hostPort as keyof typeof commonPorts]) {
        issues.push({
          type: "info",
          message: `Service "${serviceName}" uses port ${hostPort} (${commonPorts[hostPort as keyof typeof commonPorts]}). Ensure this doesn't conflict with existing services`,
          line: portsLine,
          code: "service-common-port",
        })
      }
    }
  })
}

function validateVolumeMappings(
  serviceName: string,
  serviceConfig: string,
  startLine: number,
  endLine: number,
  lines: string[],
  issues: ValidationIssue[],
) {
  // Find the volumes section line within this service
  let volumesLineIndex = -1
  for (let i = startLine - 1; i < endLine; i++) {
    if (lines[i] && lines[i].trim() === "volumes:") {
      volumesLineIndex = i
      break
    }
  }

  if (volumesLineIndex === -1) return

  // Parse volume entries line by line
  for (let i = volumesLineIndex + 1; i < endLine; i++) {
    const line = lines[i]
    if (!line) continue
    
    const trimmed = line.trim()
    
    // Stop if we hit another service property
    if (trimmed.match(/^[a-zA-Z_][a-zA-Z0-9_-]*:/) && !trimmed.startsWith("-")) {
      break
    }

    // Skip comment lines and empty lines
    if (trimmed.startsWith("#") || trimmed === "") continue

    // Check for volume definition syntax inside service (which is incorrect)
    if (line.match(/^\s{4,}[a-zA-Z][a-zA-Z0-9_-]*:\s*$/) && !line.includes("-")) {
      issues.push({
        type: "error",
        message: `Service "${serviceName}" has invalid volumes syntax: volume definitions should be at top level, not inside service volumes`,
        line: i + 1,
        code: "service-volume-definition-in-service",
      })
      continue
    }

    // Check for volume entry lines (dash followed by content)
    if (line.match(/^\s{2,6}-\s+/)) {
      const volumeEntry = line.trim().substring(2).trim()
      
      // Check for completely invalid syntax
      if (volumeEntry.startsWith(",") || volumeEntry.includes(",,")) {
        issues.push({
          type: "error",
          message: `Service "${serviceName}" has invalid volume syntax: "${volumeEntry}"`,
          line: i + 1,
          code: "service-invalid-volume-syntax",
        })
        continue
      }

      // Check for incomplete volume mappings
      if (volumeEntry.endsWith(":") && !volumeEntry.includes("::")) {
        issues.push({
          type: "error",
          message: `Service "${serviceName}" has incomplete volume mapping: "${volumeEntry}"`,
          line: i + 1,
          code: "service-incomplete-volume-mapping",
        })
        continue
      }

      // Check for mappings that start with colon (missing source)
      if (volumeEntry.startsWith(":")) {
        issues.push({
          type: "error",
          message: `Service "${serviceName}" has incomplete volume mapping: "${volumeEntry}"`,
          line: i + 1,
          code: "service-incomplete-volume-mapping",
        })
        continue
      }

      // Check for valid volume mapping format
      const parts = volumeEntry.split(":")
      if (parts.length > 3) {
        issues.push({
          type: "error",
          message: `Service "${serviceName}" has invalid volume mapping format: "${volumeEntry}"`,
          line: i + 1,
          code: "service-invalid-volume-format",
        })
        continue
      }

      // For bind mounts (host:container format), validate paths
      if (parts.length === 2) {
        const [hostPath, containerPath] = parts
        
        if (!hostPath.trim() || !containerPath.trim()) {
          issues.push({
            type: "error",
            message: `Service "${serviceName}" has empty path in volume mapping: "${volumeEntry}"`,
            line: i + 1,
            code: "service-empty-volume-path",
          })
          continue
        }

        // Check for absolute container paths (should start with /)
        if (!containerPath.trim().startsWith("/")) {
          issues.push({
            type: "warning",
            message: `Service "${serviceName}" volume mapping "${volumeEntry}" should use absolute container path`,
            line: i + 1,
            code: "service-relative-container-path",
          })
        }
      }

      // Check for named volumes vs bind mounts
      if (parts.length === 1) {
        // Single path without colon - could be named volume or incomplete bind mount
        if (volumeEntry.startsWith("/")) {
          // Absolute path without host part - likely incomplete bind mount
          issues.push({
            type: "error", 
            message: `Service "${serviceName}" has incomplete volume mapping: "${volumeEntry}"`,
            line: i + 1,
            code: "service-incomplete-bind-mount",
          })
          continue
        } else if (!volumeEntry.startsWith("./") && !volumeEntry.startsWith("../")) {
          // This might be a named volume, which is fine
          continue
        } else {
          // Relative path without colon - likely incomplete
          issues.push({
            type: "error",
            message: `Service "${serviceName}" has incomplete volume mapping: "${volumeEntry}"`,
            line: i + 1,
            code: "service-incomplete-bind-mount",
          })
          continue
        }
      }
    }
    // If we get here and the line isn't a comment, dash item, or next property, it might be invalid syntax
    else if (trimmed && !trimmed.startsWith("#")) {
      issues.push({
        type: "error",
        message: `Service "${serviceName}" has invalid volumes syntax: expected list format with dashes`,
        line: i + 1,
        code: "service-invalid-volumes-format",
      })
    }
  }
}

function validateBestPractices(yaml: string, lines: string[], issues: ValidationIssue[]) {
  // Check for networks section
  if (!yaml.includes("networks:")) {
    issues.push({
      type: "info",
      message: "No custom networks defined. Consider using custom networks for better service isolation",
      line: lines.length,
      code: "compose-missing-networks",
    })
  }

  // Check for volumes section
  if (!yaml.includes("volumes:")) {
    issues.push({
      type: "info",
      message: "No named volumes defined. Consider using named volumes for persistent data",
      line: lines.length,
      code: "compose-missing-volumes",
    })
  }

  // Check for .env file usage - find actual environment lines
  if (!yaml.includes("env_file:") && yaml.includes("environment:")) {
    // Find the first environment section line
    const envLineIndex = lines.findIndex((line) => line.trim() === "environment:")
    issues.push({
      type: "info",
      message: "Consider using .env files for environment variables instead of hardcoding them",
      line: envLineIndex !== -1 ? envLineIndex + 1 : 1,
      code: "compose-hardcoded-env",
    })
  }

  // Check for latest tags - find actual lines with latest
  lines.forEach((line, index) => {
    const trimmed = line.trim()
    if (trimmed.startsWith("image:") && trimmed.includes(":latest")) {
      issues.push({
        type: "warning",
        message: "Using 'latest' tag is not recommended for production. Use specific version tags",
        line: index + 1,
        code: "compose-latest-tag",
      })
    }
  })

  // Check for missing health checks - find services without healthcheck
  if (yaml.includes("services:") && !yaml.includes("healthcheck:")) {
    // Find the services section line
    const servicesLineIndex = lines.findIndex((line) => line.trim() === "services:")
    issues.push({
      type: "info",
      message: "No health checks defined. Consider adding health checks for better reliability",
      line: servicesLineIndex !== -1 ? servicesLineIndex + 1 : 1,
      code: "compose-missing-healthcheck",
    })
  }
}

function validateVolumeUsage(yaml: string, lines: string[], issues: ValidationIssue[]) {
  // Extract named volumes defined in the top-level volumes section
  const definedVolumes = new Set<string>()
  const usedVolumes = new Set<string>()
  
  // Find top-level volumes section (not inside services)
  const topLevelVolumesSectionIndex = lines.findIndex((line, index) => {
    // Must be at the start of a line (no indentation) and be "volumes:"
    return line.trim().startsWith('volumes:') && !line.startsWith('  ') && !line.startsWith('\t')
  })
  
  if (topLevelVolumesSectionIndex !== -1) {
    // Parse volume definitions from the top-level volumes section
    for (let i = topLevelVolumesSectionIndex + 1; i < lines.length; i++) {
      const line = lines[i]
      // Stop if we hit another top-level section or end of file
      if (line.trim() && !line.startsWith('  ') && !line.startsWith('\t')) {
        break
      }
      
      // Look for volume names (indented by 2 spaces, ending with colon)
      const volumeMatch = line.match(/^  ([a-zA-Z0-9_-]+):\s*$/)
      if (volumeMatch) {
        const volumeName = volumeMatch[1]
        definedVolumes.add(volumeName)
      }
    }
  }
  
  // Find all volume usage in services
  const servicesSectionMatch = yaml.match(/^services:\s*$/m)
  if (servicesSectionMatch) {
    const servicesSectionIndex = lines.findIndex(line => line.trim() === 'services:')
    if (servicesSectionIndex !== -1) {
      // Parse services to find volume usage and empty volume sections
      for (let i = servicesSectionIndex + 1; i < lines.length; i++) {
        const line = lines[i]
        // Stop if we hit another top-level section
        if (line.trim() && !line.startsWith('  ') && !line.startsWith('\t')) {
          break
        }
        
        // Look for volumes section within a service
        if (line.trim() === 'volumes:' && (line.startsWith('    ') || line.startsWith('\t\t'))) {
          // Check if this volumes section is empty
          let hasVolumeEntries = false
          
          // Parse volume mappings in this service
          for (let j = i + 1; j < lines.length; j++) {
            const volumeLine = lines[j]
            // Stop if we're no longer in the volumes section
            if (volumeLine.trim() && !(volumeLine.startsWith('      ') || volumeLine.startsWith('\t\t\t') || volumeLine.startsWith('    - '))) {
              break
            }
            
            // Check for volume entries (should start with - )
            const volumeEntryMatch = volumeLine.match(/^\s*-\s*(.+)$/)
            if (volumeEntryMatch) {
              hasVolumeEntries = true
              const volumeEntry = volumeEntryMatch[1].trim()
              
              // Check if it's a named volume (no path separators, no ./
              // Named volumes don't contain : with paths, just volume_name:container_path
              const parts = volumeEntry.split(':')
              if (parts.length >= 2) {
                const volumeSource = parts[0].trim()
                // If it doesn't start with ./ or / or contain windows path markers, it might be a named volume
                if (!volumeSource.startsWith('./') && 
                    !volumeSource.startsWith('/') && 
                    !volumeSource.includes('\\') &&
                    !volumeSource.match(/^[A-Za-z]:/)) {
                  usedVolumes.add(volumeSource)
                }
              }
            }
          }
          
          // Warn about empty volumes sections
          if (!hasVolumeEntries) {
            issues.push({
              type: "warning",
              message: "Service has an empty volumes section. Consider removing it or adding volume mappings",
              line: i + 1,
              code: "compose-empty-volumes-section",
            })
          }
        }
      }
    }
  }
  
  // Also check for volume usage in short-form syntax (outside of dedicated volumes sections)
  // This catches cases like: volumes: ["./data:/data", "my-volume:/app/data"]
  const volumeShortFormMatches = yaml.matchAll(/volumes:\s*\[([^\]]+)\]/g)
  for (const match of volumeShortFormMatches) {
    const volumeList = match[1]
    const volumeEntries = volumeList.split(',')
    for (const entry of volumeEntries) {
      const cleanEntry = entry.replace(/['"]/g, '').trim()
      const parts = cleanEntry.split(':')
      if (parts.length >= 2) {
        const volumeSource = parts[0].trim()
        if (!volumeSource.startsWith('./') && 
            !volumeSource.startsWith('/') && 
            !volumeSource.includes('\\') &&
            !volumeSource.match(/^[A-Za-z]:/)) {
          usedVolumes.add(volumeSource)
        }
      }
    }
  }
  
  // Check for unused defined volumes
  definedVolumes.forEach(volumeName => {
    if (!usedVolumes.has(volumeName)) {
      const volumeLineIndex = lines.findIndex(line => 
        line.trim() === `${volumeName}:` && (line.startsWith('  ') || line.startsWith('\t'))
      )
      issues.push({
        type: "warning",
        message: `Named volume "${volumeName}" is defined but not used by any service`,
        line: volumeLineIndex !== -1 ? volumeLineIndex + 1 : 1,
        code: "compose-unused-volume",
      })
    }
  })
  
  // Check for used but undefined volumes
  usedVolumes.forEach(volumeName => {
    if (!definedVolumes.has(volumeName)) {
      // Find the line where this volume is used
      const volumeUsageLineIndex = lines.findIndex(line => 
        line.includes(`- ${volumeName}:`) || line.includes(`-${volumeName}:`)
      )
      issues.push({
        type: "error",
        message: `Named volume "${volumeName}" is used but not defined in the volumes section`,
        line: volumeUsageLineIndex !== -1 ? volumeUsageLineIndex + 1 : 1,
        code: "compose-undefined-volume",
      })
    }
  })
}
