"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Eye,
  Container,
  Network,
  HardDrive,
  Globe,
  Settings,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight,
  EyeOff,
  Terminal,
  Shield,
  Cpu,
  RotateCcw,
  GitBranch,
} from "lucide-react"
import { parseComposeOverview, parseDockerComposeStructured } from "./utils/composeParser"
import { validateDockerCompose } from "./utils/validator"
import { ValidationOverview } from "./ValidationOverview"

interface ConfigurationPanelProps {
  compose: string
  view: "split" | "editor" | "configuration"
  onGoToLine?: (line: number) => void
}

export function ConfigurationPanel({ compose, view, onGoToLine }: ConfigurationPanelProps) {
  const { servicesCount, networksCount, volumesCount } = parseComposeOverview(compose)
  const parsedData = parseDockerComposeStructured(compose)
  const validation = validateDockerCompose(compose)
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())

  const toggleService = (serviceName: string) => {
    const newExpanded = new Set(expandedServices)
    if (newExpanded.has(serviceName)) {
      newExpanded.delete(serviceName)
    } else {
      newExpanded.add(serviceName)
    }
    setExpandedServices(newExpanded)
  }

  const expandAll = () => {
    setExpandedServices(new Set(parsedData.services.map((s) => s.name)))
  }

  const collapseAll = () => {
    setExpandedServices(new Set())
  }

  if (view === "editor") return null

  return (
    <div className={`${view === "split" ? "w-full lg:w-1/2 h-1/2 lg:h-full" : "w-full h-full"} flex flex-col`}>
      {/* Header */}
      <div className="p-3 lg:p-4 border-b min-h-[60px] lg:min-h-[72px] flex items-center">
        <div className="flex items-center justify-between w-full">
          <h2 className="font-semibold flex items-center gap-2 text-sm lg:text-base">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Configuration</span>
            <span className="sm:hidden">Config</span>
          </h2>
          <div className="flex items-center gap-1 lg:gap-2 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Container className="w-3 h-3" />
              <span className="hidden sm:inline">{servicesCount} Services</span>
              <span className="sm:hidden">{servicesCount}S</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <Network className="w-3 h-3" />
              <span className="hidden sm:inline">{networksCount} Networks</span>
              <span className="sm:hidden">{networksCount}N</span>
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <HardDrive className="w-3 h-3" />
              <span className="hidden sm:inline">{volumesCount} Volumes</span>
              <span className="sm:hidden">{volumesCount}V</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-2 lg:p-4 overflow-y-auto monaco-scrollbar space-y-3 lg:space-y-4">
        {/* Validation Overview */}
        <ValidationOverview validation={validation} onGoToLine={onGoToLine} />

        {/* Overview Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base lg:text-lg flex items-center gap-2">
              <Info className="w-4 lg:w-5 h-4 lg:h-5 text-primary" />
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 lg:gap-4">
              <div className="text-center p-2 lg:p-3 bg-muted/50 rounded-lg">
                <Container className="w-4 lg:w-6 h-4 lg:h-6 mx-auto mb-1 text-blue-500" />
                <div className="text-lg lg:text-2xl font-bold">{servicesCount}</div>
                <div className="text-xs text-muted-foreground">Services</div>
              </div>
              <div className="text-center p-2 lg:p-3 bg-muted/50 rounded-lg">
                <Network className="w-4 lg:w-6 h-4 lg:h-6 mx-auto mb-1 text-purple-500" />
                <div className="text-lg lg:text-2xl font-bold">{networksCount}</div>
                <div className="text-xs text-muted-foreground">Networks</div>
              </div>
              <div className="text-center p-2 lg:p-3 bg-muted/50 rounded-lg">
                <HardDrive className="w-4 lg:w-6 h-4 lg:h-6 mx-auto mb-1 text-orange-500" />
                <div className="text-lg lg:text-2xl font-bold">{volumesCount}</div>
                <div className="text-xs text-muted-foreground">Volumes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        {parsedData.services.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                  <Container className="w-4 lg:w-5 h-4 lg:h-5 text-blue-500" />
                  Services
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (expandedServices.size === parsedData.services.length) {
                        collapseAll()
                      } else {
                        expandAll()
                      }
                    }}
                    className="text-xs h-6 lg:h-7 px-2"
                  >
                    {expandedServices.size === parsedData.services.length ? (
                      <>
                        <EyeOff className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Collapse All</span>
                        <span className="sm:hidden">Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Expand All</span>
                        <span className="sm:hidden">Show</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {parsedData.services.map((service, index) => {
                const isExpanded = expandedServices.has(service.name)
                return (
                  <div key={service.name}>
                    {index > 0 && <Separator className="my-3" />}
                    <div className="space-y-3">
                      {/* Service Header - Always Visible */}
                      <div
                        className="flex items-center justify-between cursor-pointer hover:bg-muted/30 p-2 rounded-md transition-colors"
                        onClick={() => toggleService(service.name)}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 flex-shrink-0">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </Button>
                          <h4 className="font-semibold text-blue-400 truncate">{service.name}</h4>
                        </div>
                        <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
                          {service.image && (
                            <Badge variant="outline" className="text-xs max-w-[120px] lg:max-w-none truncate">
                              {service.image}
                            </Badge>
                          )}
                          {/* Quick stats when collapsed */}
                          {!isExpanded && (
                            <div className="flex items-center gap-1 lg:gap-2 text-xs text-muted-foreground">
                              {service.ports.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {service.ports.length}
                                </span>
                              )}
                              {service.environment.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Settings className="w-3 h-3" />
                                  {service.environment.length}
                                </span>
                              )}
                              {service.volumes.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <HardDrive className="w-3 h-3" />
                                  {service.volumes.length}
                                </span>
                              )}
                              {service.sysctls.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Cpu className="w-3 h-3" />
                                  {service.sysctls.length}
                                </span>
                              )}
                              {service.cap_add.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  {service.cap_add.length}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Service Details - Expandable */}
                      <div
                        className={`overflow-hidden transition-all duration-200 ease-in-out ${
                          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="pl-4 lg:pl-8 space-y-3">
                          <div className="grid grid-cols-1 gap-3 text-sm">
                            {/* Ports */}
                            {service.ports.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Globe className="w-3 h-3" />
                                  <span className="font-medium">Ports</span>
                                </div>
                                {service.ports.map((port, i) => (
                                  <div key={i} className="ml-4 text-xs">
                                    <code className="bg-blue-500/20 text-blue-400 px-1 rounded mr-1">{port.host}</code>→
                                    <code className="bg-green-500/20 text-green-400 px-1 rounded ml-1">
                                      {port.container}
                                    </code>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Environment */}
                            {service.environment.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Settings className="w-3 h-3" />
                                  <span className="font-medium">Environment ({service.environment.length})</span>
                                </div>
                                <div className="ml-4 space-y-1">
                                  {service.environment.map((env, i) => (
                                    <div key={i} className="text-xs break-all">
                                      <code className="bg-muted px-1 rounded">{env.key}</code>
                                      {env.value && (
                                        <>
                                          <span className="mx-1">=</span>
                                          <span className="text-muted-foreground">{env.value}</span>
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Volumes */}
                            {service.volumes.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <HardDrive className="w-3 h-3" />
                                  <span className="font-medium">Volumes</span>
                                </div>
                                {service.volumes.map((volume, i) => (
                                  <div key={i} className="ml-4 text-xs break-all">
                                    <code className="bg-blue-500/20 text-blue-400 px-1 rounded mr-1">
                                      {volume.host}
                                    </code>
                                    →
                                    <code className="bg-green-500/20 text-green-400 px-1 rounded ml-1">
                                      {volume.container}
                                    </code>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Networks */}
                            {service.networks.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Network className="w-3 h-3" />
                                  <span className="font-medium">Networks</span>
                                </div>
                                <div className="ml-4 space-y-1">
                                  {service.networks.map((network, i) => (
                                    <div key={i} className="text-xs break-all">
                                      <code className="bg-purple-500/20 text-purple-400 px-1 rounded">
                                        {network.name}
                                      </code>
                                      {network.ip && <span className="ml-1 text-muted-foreground">({network.ip})</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Sysctls */}
                            {service.sysctls.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Cpu className="w-3 h-3" />
                                  <span className="font-medium">System Controls</span>
                                </div>
                                <div className="ml-4 space-y-1">
                                  {service.sysctls.map((sysctl, i) => (
                                    <div key={i} className="text-xs break-all">
                                      <code className="bg-muted px-1 rounded">{sysctl.key}</code>
                                      <span className="mx-1">=</span>
                                      <span className="text-muted-foreground">{sysctl.value}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Capabilities */}
                            {service.cap_add.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Shield className="w-3 h-3" />
                                  <span className="font-medium">Added Capabilities</span>
                                </div>
                                <div className="ml-4 space-y-1">
                                  {service.cap_add.map((capability, i) => (
                                    <div key={i} className="text-xs">
                                      <code className="bg-red-500/20 text-red-400 px-1 rounded">
                                        {capability}
                                      </code>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Additional Info */}
                          {(service.depends_on.length > 0 || service.restart || service.command) && (
                              <div className="space-y-2 text-xs text-muted-foreground">
                                {service.depends_on.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <GitBranch className="w-3 h-3" />
                                      <span className="font-medium">Depends on</span>
                                    </div>
                                    <div className="ml-4 space-y-1">
                                      {service.depends_on.map((dependency, i) => (
                                        <div key={i} className="text-xs break-all">
                                          <code className="bg-muted px-1 rounded">{dependency}</code>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {service.restart && (
                                  <div>
                                    <div className="flex items-center gap-1 mb-1">
                                      <RotateCcw className="w-3 h-3" />
                                      <span className="font-medium">Restart:</span>
                                    </div>
                                    <div className="ml-4">
                                      <code className="bg-yellow-500/20 text-yellow-400 px-1 rounded">
                                        {service.restart}
                                      </code>
                                    </div>
                                  </div>
                                )}
                                {service.command && (
                                  <div>
                                    <div className="flex items-center gap-1 mb-1">
                                      <Terminal className="w-3 h-3" />
                                      <span className="font-medium">Command:</span>
                                    </div>
                                    <div className="ml-4">
                                      {Array.isArray(service.command) ? (
                                        <div className="space-y-1">
                                          {service.command.map((cmd, i) => (
                                            <div key={i} className="text-xs">
                                              <code className="bg-muted px-1 rounded font-mono break-all">{cmd}</code>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <code className="bg-muted px-1 rounded font-mono text-xs break-all">
                                          {service.command}
                                        </code>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Networks */}
        {parsedData.networks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                <Network className="w-4 lg:w-5 h-4 lg:h-5 text-purple-500" />
                Networks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {parsedData.networks.map((network, index) => (
                <div key={network.name}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-purple-400 truncate">{network.name}</h4>
                      {network.external && (
                        <Badge variant="outline" className="text-xs text-orange-400 flex-shrink-0">
                          External
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {network.external ? (
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                          <span>Must be created separately before running</span>
                        </div>
                      ) : (
                        <span>
                          Custom network for service communication
                          {network.driver && ` (${network.driver} driver)`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Volumes */}
        {parsedData.volumes.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                <HardDrive className="w-4 lg:w-5 h-4 lg:h-5 text-orange-500" />
                Volumes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {parsedData.volumes.map((volume, index) => (
                <div key={volume}>
                  {index > 0 && <Separator className="my-3" />}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-orange-400 break-all">{volume}</h4>
                    <div className="text-sm text-muted-foreground">
                      Named Docker volume - persistent storage that survives container restarts
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Prerequisites Warning */}
        {parsedData.networks.some((n) => n.external) && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardHeader className="pb-3">
              <CardTitle className="text-base lg:text-lg flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                <AlertTriangle className="w-4 lg:w-5 h-4 lg:h-5" />
                Prerequisites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">This compose file uses external networks. Create them first:</p>
              <div className="space-y-2">
                {parsedData.networks
                  .filter((n) => n.external)
                  .map((network) => (
                    <code
                      key={network.name}
                      className="block bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 p-2 rounded text-xs font-mono break-all"
                    >
                      docker network create {network.name}
                    </code>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
