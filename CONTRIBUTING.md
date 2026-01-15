# Contributing to MicroStore

Thank you for your interest in contributing to MicroStore! We welcome contributions from the community and appreciate your help in making this library better.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Your favorite editor (we recommend VS Code)

### Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/microstore.git
   cd microstore
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Workflow

### Available Scripts

```bash
# Start development mode (watch builds)
npm run dev

# Build the library
npm run build

# Run type checking
npm run type-check

# Format code with Prettier
npm run format

# Check code formatting
npm run format:check

# Test React compatibility
npm run test:compatibility

# Clean build artifacts
npm run clean
```

### Development Guidelines

1. **Write TypeScript**: All new code should be written in TypeScript with proper type definitions
2. **Follow existing patterns**: Look at existing code for consistency in structure and naming
3. **Keep it simple**: Prefer simple, readable solutions over complex ones
4. **Document as you go**: Add JSDoc comments for public APIs

### Code Style

We use Prettier for code formatting. Please run `npm run format` before committing to ensure consistent formatting.

- Use TypeScript strict mode
- Prefer `const` over `let` when possible
- Use descriptive variable and function names
- Add JSDoc comments for exported functions and classes

## 🧪 Testing

Currently, we use the build system and TypeScript compiler for validation:

```bash
# Ensure your code builds without errors
npm run build

# Ensure types are correct
npm run type-check

# Test with different React versions
npm run test:compatibility
```

### Future Testing Plans

We plan to add comprehensive testing with:

- Unit tests (Jest/Vitest)
- Integration tests
- React Testing Library for hooks

## 📝 Pull Request Guidelines

### Before Submitting

1. **Test your changes** thoroughly
2. **Run the build** to ensure no compilation errors
3. **Format your code** with `npm run format`
4. **Update documentation** if needed
5. **Add/update type definitions** for new features

### PR Requirements

- **Clear title** describing what the PR does
- **Detailed description** explaining:
  - What problem this solves
  - How you solved it
  - Any breaking changes
  - Testing you've done
- **Link related issues** if applicable
- **Keep changes focused** - one feature/fix per PR when possible

### PR Template

```markdown
## Description

Brief summary of changes

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that breaks existing functionality)
- [ ] Documentation update

## Testing

- [ ] Code builds successfully (`npm run build`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Code is formatted (`npm run format`)
- [ ] Manual testing completed

## Related Issues

Closes #(issue number)
```

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details**:
   - MicroStore version
   - React version
   - TypeScript version
   - Browser (if applicable)
5. **Minimal reproduction** (CodeSandbox, repo, etc.)

### Feature Requests

For new features:

1. **Describe the problem** you're trying to solve
2. **Explain your proposed solution**
3. **Consider alternatives** you've thought about
4. **Think about backwards compatibility**

## 🔧 Architecture Notes

### Core Concepts

- **MicroStore**: Main store class built on TinyBase
- **Schemas**: Define data structure and relationships
- **Transforms**: Handle serialization/deserialization
- **Interpreters**: Parse different API response formats
- **Reactive Hooks**: Provide reactive access to normalized data

### File Structure

```
src/
├── index.ts          # Main exports
├── microstore.ts     # Core MicroStore class
├── provider.tsx      # React context provider
├── reactive.ts       # useReactive hook
├── interpreter.ts    # REST response interpreter
├── transforms.ts     # Built-in field transforms
└── types.ts          # TypeScript definitions
```

### Dependencies

- **TinyBase**: Core reactive data store
- **Ember Inflector**: Pluralization/singularization
- **Lodash-ES**: Utility functions

## 🚦 Release Process

Releases are handled by maintainers:

1. Version bump in package.json
2. Update CHANGELOG.md
3. Create GitHub release
4. Publish to npm

## 💬 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Code Comments**: For implementation details

## 🤝 Code of Conduct

### Our Standards

- **Be respectful** and inclusive
- **Be constructive** in discussions
- **Focus on the code**, not the person
- **Help others learn** and grow

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Personal attacks
- Publishing others' private information

## 📋 Current Contribution Opportunities

### High Priority

- [ ] Add comprehensive test suite
- [ ] Implement TinyBase relationships support
- [ ] Add more field transform types
- [ ] Improve TypeScript type inference

### Good First Issues

- [ ] Add example applications
- [ ] Improve documentation
- [ ] Add more interpreter types
- [ ] Create migration guides

### Future Enhancements

- [ ] DevTools integration
- [ ] Performance optimizations
- [ ] Server-side rendering support
- [ ] React Native compatibility

Thank you for contributing to MicroStore! 🎉
