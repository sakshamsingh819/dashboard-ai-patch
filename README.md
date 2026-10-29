# Prompt2Patch Dashboard

Projector page:  /prompt2patch/        (open on the projector laptop, press F for fullscreen)
Admin page:      /prompt2patch/admin/  (open on the admin laptop)
API (serverless): /api/*               (needs Upstash Redis + ADMIN_PASSWORD, see DEPLOYMENT_GUIDE.pdf)

Folders
  public/prompt2patch/        projector app (poster, timer, music, hints overlay, reveal)
  public/prompt2patch/admin/  admin dashboard
  api/                        Vercel serverless functions
  vercel.json                 only needed for a standalone deployment
See DEPLOYMENT_GUIDE.pdf for step-by-step deployment.
