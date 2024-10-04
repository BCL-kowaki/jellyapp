import path from "path";

export default {
  plugins: {
      tailwindcss: {
          config: path.join(process.cwd(), "tailwind.config.ts"),
      },
      autoprefixer: {},
  },
};