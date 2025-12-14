import React, { useMemo } from 'react';
import { Coworker, User } from '../types';

interface TreeNode {
  id: string;
  contact: User | Coworker;
  children: TreeNode[];
}

interface OrgChartViewProps {
  allContacts: (User | Coworker)[];
}

const buildTree = (contacts: (User | Coworker)[]): TreeNode[] => {
  const tree: TreeNode[] = [];
  const childrenOf: { [key: string]: TreeNode[] } = {};

  contacts.forEach(contact => {
    const id = contact.email;
    if (!childrenOf[id]) {
      childrenOf[id] = [];
    }
  });

  contacts.forEach(contact => {
    const id = contact.email;
    const reportsTo = contact.reportsTo;

    const node: TreeNode = {
        id: id,
        contact: contact,
        children: childrenOf[id]
    };

    if (reportsTo && childrenOf[reportsTo]) {
      childrenOf[reportsTo].push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
};

const Node = ({ node }: { node: TreeNode }) => {
  const isUser = 'username' in node.contact;
  return (
    <li className="flex flex-col items-center relative">
        <div className="px-4 py-2 bg-slate-100 dark:bg-retro-gray-800 border-2 border-slate-300 dark:border-slate-600 rounded-md shadow-lg text-center z-10 w-64">
            <h3 className="font-bold text-base text-vista-blue-dark dark:text-vista-blue-mid">{node.contact.name}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{node.contact.role}</p>
            <p className="text-xs text-slate-500">{node.contact.department}</p>
             <div className="mt-1 pt-1 border-t border-dashed border-slate-300 dark:border-slate-700 text-xs text-sky-700 dark:text-sky-400">
                {isUser ? 'User' : 'AI Coworker'}
            </div>
        </div>

        {node.children && node.children.length > 0 && (
            <ul className="flex justify-center gap-x-4 pt-12 relative before:content-[''] before:absolute before:left-1/2 before:top-0 before:h-6 before:border-l-2 before:border-slate-400 dark:before:border-slate-600">
                {node.children.map(childNode => (
                    <Node key={childNode.id} node={childNode} />
                ))}
            </ul>
        )}
    </li>
  );
};


export default function OrgChartView({ allContacts }: OrgChartViewProps) {
  const orgTree = useMemo(() => buildTree(allContacts), [allContacts]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-retro-gray-900 shadow-inner-dark rounded-md border border-black/30 overflow-hidden">
        <header className="p-4 bg-vista-header-bg border-b border-black/20 flex-shrink-0">
            <h2 className="text-xl font-bold text-slate-800" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>Company Organizational Chart</h2>
            <p className="text-sm text-slate-700" style={{textShadow: '0 1px 0 rgba(255,255,255,0.7)'}}>Visual reporting structure for all personnel.</p>
        </header>

        <div className="flex-grow p-8 text-center overflow-auto">
            {orgTree.length > 0 ? (
                <ul className="inline-flex flex-col items-center justify-center gap-y-4">
                  {orgTree.map(node => (
                      <Node key={node.id} node={node} />
                  ))}
                </ul>
            ) : (
                <p>No organizational structure to display. Assign managers in the Admin Console.</p>
            )}
        </div>
    </div>
  );
}