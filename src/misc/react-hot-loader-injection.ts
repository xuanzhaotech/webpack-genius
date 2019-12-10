import * as babelTypes from '@babel/types';

export default () => {
  return {
    visitor: {
      CallExpression(path: { node: babelTypes.CallExpression, parentPath: any }) {
        if (
          path.node.callee &&
          path.node.callee.type === 'MemberExpression' &&
          path.node.callee.property.name === 'render' &&
          typeof path.node.arguments === 'object' &&
          path.node.arguments.length >= 2 &&
          path.node.arguments[0].type === 'JSXElement'
        ) {
          // @ts-ignore
          const dom = path.get('arguments.0');
          // Avoid duplicated import
          const HotName = 'WebpackGeniusHot' + Date.now();
          let parentPath = path.parentPath;

          while (parentPath.parentPath.type !== 'Program') {
            parentPath = parentPath.parentPath;
          }

          parentPath.insertBefore(babelTypes.importDeclaration(
            [babelTypes.importDefaultSpecifier(babelTypes.identifier(HotName))],
            babelTypes.stringLiteral(require.resolve('webpack-genius/misc/hot-react'))
          ));

          parentPath.insertBefore(
            babelTypes.ifStatement(
              babelTypes.memberExpression(babelTypes.identifier('module'), babelTypes.identifier('hot')),
              babelTypes.blockStatement([
                babelTypes.expressionStatement(
                  babelTypes.callExpression(
                    babelTypes.memberExpression(
                      babelTypes.memberExpression(babelTypes.identifier('module'), babelTypes.identifier('hot')),
                      babelTypes.identifier('accept')
                    ),
                    []
                  )
                )
              ])
            )
          );

          dom.replaceWith(
            babelTypes.jsxElement(
              babelTypes.jsxOpeningElement(babelTypes.jsxIdentifier(HotName), [], false),
              babelTypes.jsxClosingElement(babelTypes.jsxIdentifier(HotName)),
              [dom.node],
              false
            )
          );
        }
      },
    }
  };
};
