# ===== Stage 1: Build Stage =====
FROM public.ecr.aws/lambda/nodejs:20 AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript build)
RUN npm install

# Copy the rest of your source code
COPY . .

# Ensure seed data is included
COPY src/seed/data ./src/seed/data

# Build TypeScript to JavaScript (output in /app/dist)
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# ===== Stage 2: Production Image =====
FROM public.ecr.aws/lambda/nodejs:20

# Set Lambda working directory
WORKDIR ${LAMBDA_TASK_ROOT}

# Copy built JavaScript files
COPY --from=build /app/dist ${LAMBDA_TASK_ROOT}

# Copy production dependencies
COPY --from=build /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules

# Copy seed data
COPY --from=build /app/src/seed/data ${LAMBDA_TASK_ROOT}/seed/data

# Copy package.json (optional, useful for some modules)
COPY --from=build /app/package*.json ${LAMBDA_TASK_ROOT}

# Set production environment variable
ENV NODE_ENV=production

# Command to start the Lambda function
# Ensure your handler path matches your compiled JS
CMD ["index.handler"]
