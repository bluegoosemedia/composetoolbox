export interface ComposeOverview {
  servicesCount: number
  networksCount: number
  volumesCount: number
}

export interface ServiceConfig {
  name: string
  image?: string
  ports: { host: string; container: string }[]
  environment: { key: string; value?: string }[]
  volumes: { host: string; container: string }[]
  networks: { name: string; ip?: string }[]
  depends_on: string[]
  restart?: string
  command?: string | string[] // Allow both string and array formats
  sysctls: { key: string; value: string }[]
  cap_add: string[]
}

export interface NetworkConfig {
  name: string
  external: boolean
  driver?: string
}

export interface ParsedComposeData {
  services: ServiceConfig[]
  networks: NetworkConfig[]
  volumes: string[]
}

export const parseComposeOverview = (yaml: string): ComposeOverview => {
  const lines = yaml.split("\n")
  let servicesCount = 0
  let networksCount = 0
  let volumesCount = 0

  let servicesStartIndex = -1
  let networksStartIndex = -1
  let volumesStartIndex = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === "services:") servicesStartIndex = i
    if (line === "networks:") networksStartIndex = i
    if (line === "volumes:") volumesStartIndex = i
  }

  // Count services
  if (servicesStartIndex !== -1) {
    for (let i = servicesStartIndex + 1; i < lines.length; i++) {
      const line = lines[i]
      if (line.match(/^[a-zA-Z]/) && !line.startsWith("  ")) break
      if (line.match(/^ {2}[a-zA-Z][a-zA-Z0-9_-]*:$/)) {
        servicesCount++
      }
    }
  }

  // Count networks - improved logic
  if (networksStartIndex !== -1) {
    for (let i = networksStartIndex + 1; i < lines.length; i++) {
      const line = lines[i]
      if (line.match(/^[a-zA-Z]/) && !line.startsWith("  ")) break
      // Look for network definitions (2 spaces + name + optional colon)
      if (line.match(/^ {2}[a-zA-Z][a-zA-Z0-9_-]*:?$/)) {
        networksCount++
      }
    }
  }

  // Count volumes - improved logic
  if (volumesStartIndex !== -1) {
    for (let i = volumesStartIndex + 1; i < lines.length; i++) {
      const line = lines[i]
      if (line.match(/^[a-zA-Z]/) && !line.startsWith("  ")) break
      // Look for volume definitions (2 spaces + name + optional colon)
      if (line.match(/^ {2}[a-zA-Z][a-zA-Z0-9_.-]*:?$/)) {
        volumesCount++
      }
    }
  }

  return { servicesCount, networksCount, volumesCount }
}

export const parseDockerComposeStructured = (yaml: string): ParsedComposeData => {
  const lines = yaml.split("\n")
  const services: ServiceConfig[] = []
  const networks: NetworkConfig[] = []
  const volumes: string[] = []

  // Find section indices
  let servicesStartIndex = -1
  let networksStartIndex = -1
  let volumesStartIndex = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === "services:") servicesStartIndex = i
    if (line === "networks:") networksStartIndex = i
    if (line === "volumes:") volumesStartIndex = i
  }

  // Parse services using the working logic from before
  if (servicesStartIndex !== -1) {
    for (let i = servicesStartIndex + 1; i < lines.length; i++) {
      const line = lines[i]
      // Stop if we hit another top-level section or end of file
      if (line.match(/^[a-zA-Z]/) && !line.startsWith("  ")) break
      // Find service names (exactly 2 spaces + name + colon)
      if (line.match(/^ {2}[a-zA-Z][a-zA-Z0-9_-]*:$/)) {
        const serviceName = line.trim().replace(":", "")

        // Find this service's configuration
        let serviceEndIndex = lines.length
        // Find where this service ends (next service or section)
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].match(/^ {2}[a-zA-Z]/) || lines[j].match(/^[a-zA-Z]/)) {
            serviceEndIndex = j
            break
          }
        }

        const serviceLines = lines.slice(i, serviceEndIndex)
        const serviceConfig = serviceLines.join("\n")

        const service: ServiceConfig = {
          name: serviceName,
          ports: [],
          environment: [],
          volumes: [],
          networks: [],
          depends_on: [],
          sysctls: [],
          cap_add: [],
        }

        // Parse image
        const imageMatch = serviceConfig.match(/^\s*image:\s*(.+)$/m)
        if (imageMatch) {
          service.image = imageMatch[1].trim()
        }

        // Parse restart policy
        const restartMatch = serviceConfig.match(/^\s*restart:\s*(.+)$/m)
        if (restartMatch) {
          service.restart = restartMatch[1].trim()
        }

        // Parse command - handle both single line and multi-line formats
        let commandStartIndex = -1
        for (let k = 0; k < serviceLines.length; k++) {
          if (serviceLines[k].trim().startsWith("command:")) {
            commandStartIndex = k
            break
          }
        }

        if (commandStartIndex !== -1) {
          const commandLine = serviceLines[commandStartIndex].trim()

          // Check if it's a single-line command
          if (commandLine.includes("command:") && commandLine.length > "command:".length) {
            // Single line format: command: some command here
            service.command = commandLine.substring("command:".length).trim()
          } else {
            // Multi-line format - collect all command parts as array
            const commandParts: string[] = []

            for (let k = commandStartIndex + 1; k < serviceLines.length; k++) {
              const cmdLine = serviceLines[k]
              const trimmedLine = cmdLine.trim()

              // If we hit another service property, stop
              if (trimmedLine.match(/^[a-zA-Z_][a-zA-Z0-9_-]*:/) && !trimmedLine.startsWith("-")) {
                break
              }

              // Check for command array items (dash followed by content)
              if (cmdLine.match(/^\s{2,6}-\s+/)) {
                const commandPart = cmdLine
                  .trim()
                  .substring(2)
                  .replace(/^['"]|['"]$/g, "") // Remove "- " prefix and quotes
                commandParts.push(commandPart)
              }
              // Check for multi-line string continuation (pipe or greater than)
              else if (trimmedLine && !trimmedLine.startsWith("-") && cmdLine.startsWith("    ")) {
                commandParts.push(trimmedLine)
              }
            }

            if (commandParts.length > 0) {
              // Keep as array for better display formatting
              service.command = commandParts
            }
          }
        }

        // Parse ports with detailed breakdown
        let portsStartIndex = -1
        for (let k = 0; k < serviceLines.length; k++) {
          if (serviceLines[k].trim().startsWith("ports:")) {
            portsStartIndex = k
            break
          }
        }

        if (portsStartIndex !== -1) {
          // Look for all lines that start with "    - " or "  - " but stop at next property
          for (let k = portsStartIndex + 1; k < serviceLines.length; k++) {
            const portLine = serviceLines[k]
            const trimmedLine = portLine.trim()

            // If we hit another service property, stop
            if (trimmedLine.match(/^[a-zA-Z_][a-zA-Z0-9_-]*:/) && !trimmedLine.startsWith("-")) {
              break
            }

            // Check for port lines (dash followed by content)
            if (portLine.match(/^\s{2,6}-\s+/)) {
              const port = portLine.trim().substring(2).replace(/['"]/g, "") // Remove "- " prefix and quotes
              const [hostPort, containerPort] = port.split(":")
              if (hostPort && containerPort) {
                service.ports.push({ host: hostPort, container: containerPort })
              }
            }
          }
        }

        // Parse environment variables
        let envStartIndex = -1
        for (let k = 0; k < serviceLines.length; k++) {
          if (serviceLines[k].trim().startsWith("environment:")) {
            envStartIndex = k
            break
          }
        }

        if (envStartIndex !== -1) {
          // Look for all lines that start with "    - " or "  - " but stop at next property
          for (let k = envStartIndex + 1; k < serviceLines.length; k++) {
            const envLine = serviceLines[k]
            const trimmedLine = envLine.trim()

            // If we hit another service property, stop
            if (trimmedLine.match(/^[a-zA-Z_][a-zA-Z0-9_-]*:/) && !trimmedLine.startsWith("-")) {
              break
            }

            // Check for environment variable lines (dash followed by content)
            if (envLine.match(/^\s{2,6}-\s+/)) {
              const env = envLine.trim().substring(2) // Remove "- " prefix
              const [key, value] = env.split("=")
              service.environment.push({ key, value })
            }
          }
        }

        // Parse volumes
        let volStartIndex = -1
        for (let k = 0; k < serviceLines.length; k++) {
          if (serviceLines[k].trim().startsWith("volumes:")) {
            volStartIndex = k
            break
          }
        }

        if (volStartIndex !== -1) {
          // Look for all lines that start with "    - " or "  - " but stop at next property
          for (let k = volStartIndex + 1; k < serviceLines.length; k++) {
            const volLine = serviceLines[k]
            const trimmedLine = volLine.trim()

            // If we hit another service property, stop
            if (trimmedLine.match(/^[a-zA-Z_][a-zA-Z0-9_-]*:/) && !trimmedLine.startsWith("-")) {
              break
            }

            // Check for volume lines (dash followed by content)
            if (volLine.match(/^\s{2,6}-\s+/)) {
              const volume = volLine
                .trim()
                .substring(2)
                .replace(/['"]/g, "")
                .replace(/#optional.*$/, "")
                .trim()
              const [hostPath, containerPath] = volume.split(":")
              if (hostPath && containerPath) {
                service.volumes.push({ host: hostPath, container: containerPath })
              }
            }
          }
        }

        // Parse service network assignments
        let netStartIndex = -1
        for (let k = 0; k < serviceLines.length; k++) {
          if (serviceLines[k].trim().startsWith("networks:")) {
            netStartIndex = k
            break
          }
        }

        if (netStartIndex !== -1) {
          // Look for network configurations
          for (let k = netStartIndex + 1; k < serviceLines.length; k++) {
            const netLine = serviceLines[k]
            const trimmedLine = netLine.trim()

            // If we hit another service property, stop
            if (trimmedLine.match(/^[a-zA-Z_][a-zA-Z0-9_-]*:/) && !trimmedLine.startsWith("-")) {
              break
            }

            // Check for network names with configuration (like "docknet:")
            if (netLine.match(/^\s+[a-zA-Z][a-zA-Z0-9_-]*:$/)) {
              const networkName = trimmedLine.replace(":", "")
              let ipAddress: string | undefined = undefined

              // Look for IP address in the following lines
              for (let l = k + 1; l < serviceLines.length; l++) {
                const nextLine = serviceLines[l]
                const nextTrimmed = nextLine.trim()

                // Stop if we hit another network or service property
                if (nextLine.match(/^\s+[a-zA-Z][a-zA-Z0-9_-]*:/) || nextTrimmed.match(/^[a-zA-Z_][a-zA-Z0-9_-]*:/)) {
                  break
                }

                if (nextTrimmed.startsWith("ipv4_address:")) {
                  ipAddress = nextTrimmed.split(":")[1].trim()
                  break
                }
              }

              service.networks.push({ name: networkName, ip: ipAddress })
            }
            // Simple network list format (like "- networkname")
            else if (netLine.match(/^\s+-\s+/)) {
              const networkName = netLine.trim().substring(2)
              service.networks.push({ name: networkName, ip: undefined })
            }
          }
        }

        // Parse depends_on
        let dependsOnStartIndex = -1
        for (let k = 0; k < serviceLines.length; k++) {
          if (serviceLines[k].trim().startsWith("depends_on:")) {
            dependsOnStartIndex = k
            break
          }
        }

        if (dependsOnStartIndex !== -1) {
          for (let k = dependsOnStartIndex + 1; k < serviceLines.length; k++) {
            const dependsLine = serviceLines[k]
            const trimmedLine = dependsLine.trim()

            // If we hit another service property, stop
            if (trimmedLine.match(/^[a-zA-Z_][a-zA-Z0-9_-]*:/) && !trimmedLine.startsWith("-")) {
              break
            }

            // Check for dependency lines (dash followed by content)
            if (dependsLine.match(/^\s{2,6}-\s+/)) {
              const dependency = dependsLine.trim().substring(2).trim() // Remove "- " prefix
              service.depends_on.push(dependency)
            }
          }
        }

        // Parse sysctls
        let sysctlsStartIndex = -1
        for (let k = 0; k < serviceLines.length; k++) {
          if (serviceLines[k].trim().startsWith("sysctls:")) {
            sysctlsStartIndex = k
            break
          }
        }

        if (sysctlsStartIndex !== -1) {
          for (let k = sysctlsStartIndex + 1; k < serviceLines.length; k++) {
            const sysctlLine = serviceLines[k]
            const trimmedLine = sysctlLine.trim()

            // If we hit another service property, stop
            if (trimmedLine.match(/^[a-zA-Z_][a-zA-Z0-9_-]*:/) && !trimmedLine.startsWith("-")) {
              break
            }

            // Check for sysctl lines (dash followed by content)
            if (sysctlLine.match(/^\s{2,6}-\s+/)) {
              const sysctl = sysctlLine.trim().substring(2) // Remove "- " prefix
              const [key, value] = sysctl.split("=")
              if (key && value) {
                service.sysctls.push({ key: key.trim(), value: value.trim() })
              }
            }
          }
        }

        // Parse cap_add
        let capAddStartIndex = -1
        for (let k = 0; k < serviceLines.length; k++) {
          if (serviceLines[k].trim().startsWith("cap_add:")) {
            capAddStartIndex = k
            break
          }
        }

        if (capAddStartIndex !== -1) {
          for (let k = capAddStartIndex + 1; k < serviceLines.length; k++) {
            const capLine = serviceLines[k]
            const trimmedLine = capLine.trim()

            // If we hit another service property, stop
            if (trimmedLine.match(/^[a-zA-Z_][a-zA-Z0-9_-]*:/) && !trimmedLine.startsWith("-")) {
              break
            }

            // Check for capability lines (dash followed by content)
            if (capLine.match(/^\s{2,6}-\s+/)) {
              const capability = capLine.trim().substring(2).trim() // Remove "- " prefix
              service.cap_add.push(capability)
            }
          }
        }

        services.push(service)
      }
    }
  }

  // Parse networks - only look in the actual networks section
  if (networksStartIndex !== -1) {
    // Find where networks section ends
    let networksEndIndex = lines.length
    for (let i = networksStartIndex + 1; i < lines.length; i++) {
      if (lines[i].match(/^[a-zA-Z]/) && !lines[i].startsWith(" ")) {
        networksEndIndex = i
        break
      }
    }

    for (let i = networksStartIndex + 1; i < networksEndIndex; i++) {
      const line = lines[i]

      // Look for network definitions (2 spaces + name + optional colon)
      if (line.match(/^ {2}[a-zA-Z][a-zA-Z0-9_-]*:?$/)) {
        const networkName = line.trim().replace(":", "")
        let isExternal = false
        let driver: string | undefined = undefined

        // Look ahead for external and driver properties within this network's scope
        for (let j = i + 1; j < networksEndIndex; j++) {
          const nextLine = lines[j]

          // Stop if we hit another network definition
          if (nextLine.match(/^ {2}[a-zA-Z]/)) break

          if (nextLine.includes("external: true")) isExternal = true
          if (nextLine.match(/^\s+driver:\s*(.+)$/)) {
            driver = nextLine.match(/^\s+driver:\s*(.+)$/)?.[1].trim()
          }
        }

        networks.push({ name: networkName, external: isExternal, driver })
      }
    }
  }

  // Parse volumes - only look in the actual volumes section
  if (volumesStartIndex !== -1) {
    // Find where volumes section ends
    let volumesEndIndex = lines.length
    for (let i = volumesStartIndex + 1; i < lines.length; i++) {
      if (lines[i].match(/^[a-zA-Z]/) && !lines[i].startsWith(" ")) {
        volumesEndIndex = i
        break
      }
    }

    for (let i = volumesStartIndex + 1; i < volumesEndIndex; i++) {
      const line = lines[i]

      // Look for volume definitions (2 spaces + name + optional colon)
      // Allow dots in volume names (like caddy.etc, caddy.var)
      if (line.match(/^ {2}[a-zA-Z][a-zA-Z0-9_.-]*:?$/)) {
        const volumeName = line.trim().replace(":", "")
        volumes.push(volumeName)
      }
    }
  }

  return { services, networks, volumes }
}

// Keep the old function for backward compatibility
export const explainDockerCompose = (yaml: string): string => {
  const parsedData = parseDockerComposeStructured(yaml)

  // This is now just a fallback - the new ConfigurationPanel uses the structured data directly
  return `<div class="text-muted-foreground">Configuration parsed successfully. ${parsedData.services.length} services, ${parsedData.networks.length} networks, ${parsedData.volumes.length} volumes found.</div>`
}
