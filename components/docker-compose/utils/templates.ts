export const getQuickTemplates = () => ({
  service: {
    name: "Generic Service",
    icon: "Container",
    code: `  new-service:
    image: alpine:latest
    ports:
      - "8080:80"
    environment:
      - ENV_VAR=value
    volumes:
      - ./data:/app/data
    networks:
      - default`,
  },
  database: {
    name: "Database Service",
    icon: "Database",
    code: `  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=mydb
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"`,
  },
  network: {
    name: "Custom Network",
    icon: "Network",
    code: `networks:
  custom-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16`,
  },
  volume: {
    name: "Named Volume",
    icon: "HardDrive",
    code: `volumes:
  data-volume:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /host/path`,
  },
  environment: {
    name: "Environment Variables",
    icon: "Settings",
    code: `    environment:
      - NODE_ENV=production
      - API_KEY=your-api-key
      - DATABASE_URL=postgresql://user:pass@host:5432/db`,
  },
  ports: {
    name: "Port Mappings",
    icon: "Globe",
    code: `    ports:
      - "80:80"
      - "443:443"
      - "127.0.0.1:3000:3000"`,
  },
})
