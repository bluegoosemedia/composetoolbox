"use client"
import {
  Container,
  Network,
  Database,
  Settings,
  Globe,
  HardDrive,
  Lightbulb,
  Terminal,
  Wifi,
  HardDriveIcon as HardDisk,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface HelpDialogProps {
  show: boolean
  onClose: () => void
}

export function HelpDialog({ show, onClose }: HelpDialogProps) {
  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Compose Toolbox Reference</DialogTitle>
          <DialogDescription>Complete reference guide for Docker Compose configuration and commands</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                <Container className="w-5 h-5" />
                Services
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="bg-muted px-1 rounded">image:</code> - Docker image to use
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">build:</code> - Build context for custom images
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">ports:</code> - Port mappings (host:container)
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">volumes:</code> - Volume mounts
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">environment:</code> - Environment variables
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">depends_on:</code> - Service dependencies
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">restart:</code> - Restart policy
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">command:</code> - Override default command
                </div>
              </div>
            </div>

            {/* Networks */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                <Network className="w-5 h-5" />
                Networks
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="bg-muted px-1 rounded">driver: bridge</code> - Bridge network
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">driver: host</code> - Host network
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">driver: overlay</code> - Overlay network
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">ipam:</code> - IP address management
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">external: true</code> - Use existing network
                </div>
              </div>
            </div>

            {/* Volumes */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Volumes
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="bg-muted px-1 rounded">driver: local</code> - Local volume
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">external: true</code> - Use existing volume
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">driver_opts:</code> - Driver options
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">./path:/container/path</code> - Bind mount
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">volume_name:/path</code> - Named volume
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Environment
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="bg-muted px-1 rounded">- KEY=value</code> - Set variable
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">- KEY</code> - Pass from host
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">env_file:</code> - Load from file
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">.env</code> - Default env file
                </div>
              </div>
            </div>

            {/* Port Mappings */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Port Mappings
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="bg-muted px-1 rounded">"80:80"</code> - Host:Container
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">"127.0.0.1:80:80"</code> - Bind to localhost
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">"80"</code> - Random host port
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">"80-85:80-85"</code> - Port range
                </div>
              </div>
            </div>

            {/* Common Images */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
                <Database className="w-5 h-5" />
                Common Images
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <code className="bg-muted px-1 rounded">nginx:alpine</code> - Web server
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">postgres:15</code> - PostgreSQL database
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">mysql:8</code> - MySQL database
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">redis:alpine</code> - Redis cache
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">node:18-alpine</code> - Node.js runtime
                </div>
                <div>
                  <code className="bg-muted px-1 rounded">python:3.11-slim</code> - Python runtime
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Tips
            </h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Always specify restart policies for production services</li>
              <li>• Use named volumes for persistent data</li>
              <li>• Group related services with custom networks</li>
              <li>• Use environment files (.env) for sensitive data</li>
              <li>
                • Test your compose file with: <code className="bg-muted px-1 rounded">docker-compose config</code>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Docker Compose Commands
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Basic Operations */}
              <div>
                <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                  <Container className="w-4 h-4" />
                  Basic Operations
                </h4>
                <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                  <div className="text-muted-foreground"># Start services in background</div>
                  <div>docker-compose up -d</div>
                  <div className="text-muted-foreground"># Start specific service</div>
                  <div>docker-compose up -d web</div>
                  <div className="text-muted-foreground"># Stop all services</div>
                  <div>docker-compose down</div>
                  <div className="text-muted-foreground"># Stop and remove volumes</div>
                  <div>docker-compose down -v</div>
                  <div className="text-muted-foreground"># Restart services</div>
                  <div>docker-compose restart</div>
                </div>
              </div>

              {/* Monitoring & Logs */}
              <div>
                <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  Monitoring & Logs
                </h4>
                <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                  <div className="text-muted-foreground"># View logs (follow)</div>
                  <div>docker-compose logs -f</div>
                  <div className="text-muted-foreground"># View logs for specific service</div>
                  <div>docker-compose logs -f web</div>
                  <div className="text-muted-foreground"># List running services</div>
                  <div>docker-compose ps</div>
                  <div className="text-muted-foreground"># Show service status</div>
                  <div>docker-compose top</div>
                </div>
              </div>

              {/* Container Access */}
              <div>
                <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Container Access
                </h4>
                <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                  <div className="text-muted-foreground"># Execute command in service</div>
                  <div>docker-compose exec web bash</div>
                  <div className="text-muted-foreground"># Run one-off command</div>
                  <div>docker-compose run web ls -la</div>
                  <div className="text-muted-foreground"># Scale service instances</div>
                  <div>docker-compose up -d --scale web=3</div>
                </div>
              </div>

              {/* Build & Update */}
              <div>
                <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Build & Update
                </h4>
                <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                  <div className="text-muted-foreground"># Build services</div>
                  <div>docker-compose build</div>
                  <div className="text-muted-foreground"># Build without cache</div>
                  <div>docker-compose build --no-cache</div>
                  <div className="text-muted-foreground"># Pull latest images</div>
                  <div>docker-compose pull</div>
                  <div className="text-muted-foreground"># Recreate containers</div>
                  <div>docker-compose up -d --force-recreate</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Docker Network Commands
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Network Management */}
              <div>
                <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Network Management
                </h4>
                <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                  <div className="text-muted-foreground"># List all networks</div>
                  <div>docker network ls</div>
                  <div className="text-muted-foreground"># Create bridge network</div>
                  <div>docker network create mynetwork</div>
                  <div className="text-muted-foreground"># Create with custom subnet</div>
                  <div>docker network create --subnet=172.20.0.0/16 mynet</div>
                  <div className="text-muted-foreground"># Remove network</div>
                  <div>docker network rm mynetwork</div>
                  <div className="text-muted-foreground"># Remove unused networks</div>
                  <div>docker network prune</div>
                </div>
              </div>

              {/* Network Inspection */}
              <div>
                <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Network Inspection
                </h4>
                <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                  <div className="text-muted-foreground"># Inspect network details</div>
                  <div>docker network inspect mynetwork</div>
                  <div className="text-muted-foreground"># Connect container to network</div>
                  <div>docker network connect mynet container_name</div>
                  <div className="text-muted-foreground"># Disconnect from network</div>
                  <div>docker network disconnect mynet container_name</div>
                  <div className="text-muted-foreground"># Create with driver options</div>
                  <div>docker network create --driver bridge \</div>
                  <div>&nbsp;&nbsp;--opt com.docker.network.bridge.name=br0 mynet</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <h3 className="text-lg font-semibold mb-3 text-primary flex items-center gap-2">
              <HardDisk className="w-5 h-5" />
              Docker Volume Commands
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Volume Management */}
              <div>
                <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Volume Management
                </h4>
                <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                  <div className="text-muted-foreground"># List all volumes</div>
                  <div>docker volume ls</div>
                  <div className="text-muted-foreground"># Create named volume</div>
                  <div>docker volume create myvolume</div>
                  <div className="text-muted-foreground"># Inspect volume details</div>
                  <div>docker volume inspect myvolume</div>
                  <div className="text-muted-foreground"># Remove volume</div>
                  <div>docker volume rm myvolume</div>
                  <div className="text-muted-foreground"># Remove unused volumes</div>
                  <div>docker volume prune</div>
                </div>
              </div>

              {/* Container Management */}
              <div>
                <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                  <Container className="w-4 h-4" />
                  Container Management
                </h4>
                <div className="bg-muted p-3 rounded font-mono text-xs space-y-1">
                  <div className="text-muted-foreground"># List running containers</div>
                  <div>docker ps</div>
                  <div className="text-muted-foreground"># List all containers</div>
                  <div>docker ps -a</div>
                  <div className="text-muted-foreground"># Stop container</div>
                  <div>docker stop container_name</div>
                  <div className="text-muted-foreground"># Remove container</div>
                  <div>docker rm container_name</div>
                  <div className="text-muted-foreground"># View container logs</div>
                  <div>docker logs -f container_name</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
