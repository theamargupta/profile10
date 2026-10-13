FROM public.ecr.aws/lambda/nodejs:24

# Vercel's own build container reported CLI 62.7.0 on 2026-10-13; pinning it keeps generated output repeatable.
RUN npm install -g vercel@62.7.0

ENTRYPOINT ["/bin/bash"]
