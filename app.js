/* ---------- BST ---------- */
class Node{constructor(id,name,phone){this.id=id;this.name=name;this.phone=phone;this.left=null;this.right=null}}
const T={root:null,
 ins(r,n){if(!r)return n;if(n.id<r.id)r.left=this.ins(r.left,n);else r.right=this.ins(r.right,n);return r},
 find(id){const path=[];let c=this.root;while(c){path.push(c.id);if(id===c.id)return{node:c,path};c=id<c.id?c.left:c.right}return{node:null,path}},
 minN(n){while(n.left)n=n.left;return n},
 del(r,id){if(!r)return null;
  if(id<r.id)r.left=this.del(r.left,id);else if(id>r.id)r.right=this.del(r.right,id);
  else{if(!r.left)return r.right;if(!r.right)return r.left;
   const s=this.minN(r.right);r.id=s.id;r.name=s.name;r.phone=s.phone;r.right=this.del(r.right,s.id)}
  return r},
 inorder(n=this.root,o=[]){if(n){this.inorder(n.left,o);o.push(n);this.inorder(n.right,o)}return o},
 pre(n=this.root,o=[]){if(n){o.push({id:n.id,name:n.name,phone:n.phone});this.pre(n.left,o);this.pre(n.right,o)}return o},
 h(n=this.root){return n?1+Math.max(this.h(n.left),this.h(n.right)):0}};

const KEY='contacthub.data',LOG='contacthub.log';
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function load(){let d;try{d=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(!d)d=[[50,'Alice','9876543210'],[30,'Bob','9123456780'],[70,'Carol','9988776655'],[20,'David','9012345678'],[40,'Eva','9345678901'],[60,'Frank','9456789012'],[80,'Grace','9567890123']].map(a=>({id:a[0],name:a[1],phone:a[2]}));
 d.forEach(c=>T.root=T.ins(T.root,new Node(c.id,c.name,c.phone)))}
function save(){try{localStorage.setItem(KEY,JSON.stringify(T.pre()))}catch(e){}}
function log(m){let l=[];try{l=JSON.parse(localStorage.getItem(LOG))||[]}catch(e){}
 l.unshift({m,t:new Date().toLocaleTimeString()});try{localStorage.setItem(LOG,JSON.stringify(l.slice(0,5)))}catch(e){}}

/* ---------- Shared layout ---------- */
const NAV=[['index.html','index','🏠','Overview'],['contacts.html','contacts','👥','Contacts'],['tree.html','tree','🗺️','Contact Map'],['algorithm.html','algorithm','🧠','Algorithm'],['code.html','code','💻','C Source Code'],['samples.html','samples','📄','Sample I/O']];
function shell(){const p=document.body.dataset.page;
 const side=document.createElement('aside');side.className='side panel';
 side.innerHTML='<div class="logo"><i>◈</i>ContactHub</div><nav>'+NAV.map(n=>`<a href="${n[0]}" class="${n[1]===p?'on':''}"><span>${n[2]}</span>${n[3]}</a>`).join('')+'</nav>';
 document.body.prepend(side);
 const h=document.createElement('header');h.className='top';
 h.innerHTML=`<div><h1>${document.body.dataset.title}</h1><p>${document.body.dataset.sub}</p></div><div class="user">Data Structures Mini Project<b>DS</b></div>`;
 $('.content').prepend(h)}

/* ---------- Map drawing ---------- */
function drawTree(svg,path=[]){
 if(!T.root){svg.setAttribute('viewBox','0 0 400 200');svg.style.minWidth='0';svg.innerHTML='<text x="200" y="100" fill="#8f9bd1" text-anchor="middle">No contacts yet. Add a contact to place the first pin.</text>';return}
 const pos=new Map();let i=0;
 (function w(n,d){if(!n)return;w(n.left,d+1);pos.set(n,{x:60+i++*72,y:44+d*88});w(n.right,d+1)})(T.root,0);
 const W=120+(i-1)*72,H=T.h()*88+50;let s='';
 pos.forEach((p,n)=>[n.left,n.right].forEach(c=>{if(c){const q=pos.get(c);s+=`<line class="edge ${path.includes(n.id)&&path.includes(c.id)?'on':''}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`}}));
 pos.forEach((p,n)=>{s+=`<g class="pin ${path.includes(n.id)?'on':''}" data-id="${n.id}" transform="translate(${p.x},${p.y})"><circle r="22"/><text y="5">${n.id}</text><text class="nm" y="40">${esc(n.name)}</text></g>`});
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.style.minWidth=Math.min(W,900)+'px';svg.innerHTML=s}

/* ---------- Pages ---------- */
function overview(){
 const l=T.inorder(),h=T.h();
 $('#s-count').textContent=l.length;$('#s-height').textContent=h;
 $('#s-min').textContent=l.length?l[0].id:'-';$('#s-max').textContent=l.length?l[l.length-1].id:'-';
 const p=h?Math.round(l.length/(Math.pow(2,h)-1)*100):0;$('#ring').style.setProperty('--p',p);$('#ring-v').textContent=p+'%';
 let lg=[];try{lg=JSON.parse(localStorage.getItem(LOG))||[]}catch(e){}
 $('#feed').innerHTML=lg.length?lg.map(x=>`<li>${esc(x.m)}<small>${x.t}</small></li>`).join(''):'<li>No activity yet. Add a contact to begin.</li>';
 $('#chips').innerHTML=l.length?l.map(n=>`<span>${n.id} · ${esc(n.name)}</span>`).join(''):'<span>No contacts</span>';
 drawTree($('#tree'))}

function contacts(){
 const res=(m,c)=>{const r=$('#result');r.textContent=m;r.className='result '+(c||'')};
 const table=()=>{const l=T.inorder();$('#tbody').innerHTML=l.length?l.map(n=>`<tr><td>${n.id}</td><td>${esc(n.name)}</td><td>${esc(n.phone)}</td></tr>`).join(''):'<tr><td colspan="3">No contacts yet. Use "Add New Contact" to create one.</td></tr>'};
 $('#btn-add').onclick=()=>{
  const id=parseInt($('#a-id').value),name=$('#a-name').value.trim(),ph=$('#a-phone').value.trim();
  if(!(id>0)||!name||!/^\d{7,15}$/.test(ph))return res('Enter a positive ID, a name, and a phone number with 7 to 15 digits.','bad');
  if(T.find(id).node)return res('Contact ID '+id+' already exists. Use a unique ID.','bad');
  T.root=T.ins(T.root,new Node(id,name,ph));save();log('Added '+name+' (ID '+id+')');
  res('Contact added: '+id+' '+name,'ok');['#a-id','#a-name','#a-phone'].forEach(s=>$(s).value='');table()};
 $('#btn-search').onclick=()=>{const id=parseInt($('#q-id').value);if(!(id>0))return res('Enter a contact ID to search.','bad');
  const f=T.find(id).node;f?res(`Found → ID ${f.id}, ${f.name}, ${f.phone}`,'ok'):res('Contact not found.','bad')};
 $('#btn-del').onclick=()=>{const id=parseInt($('#q-id').value);if(!(id>0))return res('Enter a contact ID to delete.','bad');
  const f=T.find(id).node;if(!f)return res('Contact not found. Nothing was deleted.','bad');
  T.root=T.del(T.root,id);save();log('Deleted ID '+id);res('Contact '+id+' deleted.','ok');table()};
 $('#btn-clear').onclick=()=>{if(confirm('Remove all contacts?')){T.root=null;save();log('Cleared all contacts');res('All contacts removed.');table()}};
 table()}

function treePage(){
 const svg=$('#tree'),m=$('#t-msg');drawTree(svg);
 $('#t-search').onclick=()=>{const id=parseInt($('#t-id').value);if(!(id>0)){m.textContent='Enter a contact ID.';return}
  const r=T.find(id);drawTree(svg,r.path);
  m.textContent=r.node?`Found ${id} after visiting ${r.path.length} node(s): ${r.path.join(' → ')}`:`Contact not found. Path taken: ${r.path.join(' → ')||'no contacts'}`};
 $('#t-inorder').onclick=()=>{drawTree(svg);const l=T.inorder();m.textContent='Inorder: ';
  l.forEach((n,i)=>setTimeout(()=>{const g=svg.querySelector(`[data-id="${n.id}"]`);if(g)g.classList.add('on');m.textContent+=n.id+(i<l.length-1?', ':'')},i*600))}}

const CODE=String.raw`#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Node {
    int id;
    char name[50];
    char phone[16];
    struct Node *left, *right;
} Node;

Node* createNode(int id, char *name, char *phone) {
    Node *t = (Node*)malloc(sizeof(Node));
    t->id = id;
    strcpy(t->name, name);
    strcpy(t->phone, phone);
    t->left = t->right = NULL;
    return t;
}

Node* search(Node *r, int id) {
    if (r == NULL || r->id == id) return r;
    return (id < r->id) ? search(r->left, id) : search(r->right, id);
}

Node* insert(Node *r, int id, char *name, char *phone) {
    if (r == NULL) return createNode(id, name, phone);
    if (id < r->id) r->left = insert(r->left, id, name, phone);
    else if (id > r->id) r->right = insert(r->right, id, name, phone);
    return r;
}

Node* minNode(Node *r) {
    while (r->left != NULL) r = r->left;
    return r;
}

Node* deleteNode(Node *r, int id) {
    if (r == NULL) return NULL;
    if (id < r->id) r->left = deleteNode(r->left, id);
    else if (id > r->id) r->right = deleteNode(r->right, id);
    else {
        if (r->left == NULL) { Node *t = r->right; free(r); return t; }
        if (r->right == NULL) { Node *t = r->left; free(r); return t; }
        Node *s = minNode(r->right);
        r->id = s->id;
        strcpy(r->name, s->name);
        strcpy(r->phone, s->phone);
        r->right = deleteNode(r->right, s->id);
    }
    return r;
}

void inorder(Node *r) {
    if (r != NULL) {
        inorder(r->left);
        printf("%-6d %-20s %s\n", r->id, r->name, r->phone);
        inorder(r->right);
    }
}

int main() {
    Node *root = NULL, *f;
    int ch, id;
    char name[50], phone[16];
    do {
        printf("\n===== Contact Management (BST) =====\n");
        printf("1.Add  2.Search  3.Delete  4.Display  5.Exit\nEnter choice: ");
        scanf("%d", &ch);
        switch (ch) {
            case 1:
                printf("Enter ID, name, phone: ");
                scanf("%d %49s %15s", &id, name, phone);
                if (search(root, id)) printf("Contact ID already exists!\n");
                else { root = insert(root, id, name, phone); printf("Contact added.\n"); }
                break;
            case 2:
                printf("Enter ID to search: ");
                scanf("%d", &id);
                f = search(root, id);
                if (f) printf("Found -> %d %s %s\n", f->id, f->name, f->phone);
                else printf("Contact not found!\n");
                break;
            case 3:
                printf("Enter ID to delete: ");
                scanf("%d", &id);
                if (search(root, id)) { root = deleteNode(root, id); printf("Contact deleted.\n"); }
                else printf("Contact not found!\n");
                break;
            case 4:
                if (root == NULL) printf("No contacts to display.\n");
                else { printf("ID     Name                 Phone\n"); inorder(root); }
                break;
            case 5: printf("Goodbye!\n"); break;
            default: printf("Invalid choice!\n");
        }
    } while (ch != 5);
    return 0;
}
`;
function codePage(){$('#src').textContent=CODE;
 $('#copy').onclick=()=>{navigator.clipboard.writeText(CODE).then(()=>{$('#copied').textContent='Copied!';setTimeout(()=>$('#copied').textContent='',1800)},()=>{$('#copied').textContent='Select the code and copy manually.'})}}

/* ---------- Boot ---------- */
load();shell();
({index:overview,contacts,tree:treePage,code:codePage})[document.body.dataset.page]?.();
