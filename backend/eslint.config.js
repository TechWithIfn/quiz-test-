import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'prisma', 'scripts', 'tests'],
  },
  ...tseslint.configs.recommended,
)
