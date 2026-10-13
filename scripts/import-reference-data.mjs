import { readFile, writeFile, mkdir } from 'node:fs/promises';
import ts from 'typescript';

const sourcePath = process.argv[2];
if (!sourcePath) throw new Error('Informe o caminho do HTML de referência.');
const source = await readFile(sourcePath, 'utf8');
const template = JSON.parse(source.split('<script type="__bundler/template">')[1].split('</script>')[0].trim());
const logic = template.match(/<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/)[1];
const ast = ts.createSourceFile('reference.js', logic, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const names = new Set(['ETAPAS', 'EMP', 'FASES', 'PK', 'SL', 'GRAD', 'BANCO', 'conexoes', 'DOCS', 'REG', 'conferencia', 'KP', 'MET', 'SEM', 'CN', 'ALL']);
const data = {};

function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return ts.isNumericLiteral(node) ? Number(node.text) : node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map((property) => {
    if (!ts.isPropertyAssignment(property)) throw new Error('Propriedade não literal.');
    return [property.name.text, literal(property.initializer)];
  }));
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'map') return literal(node.expression.expression);
  throw new Error(`Expressão não permitida: ${node.kind}`);
}

function visit(node) {
  if (ts.isVariableDeclaration(node) && names.has(node.name.text)) data[node.name.text] = literal(node.initializer);
  ts.forEachChild(node, visit);
}
visit(ast);
if (Object.keys(data).length !== names.size) throw new Error('Dados de referência incompletos.');
data.EMP = data.EMP.filter((company) => company.id === 'piersec');
await mkdir('src/features/reference', { recursive: true });
await writeFile('src/features/reference/reference-data.json', JSON.stringify(data, null, 2) + '\n');
console.log('Dados literais importados. Nenhum script do HTML foi executado.');
