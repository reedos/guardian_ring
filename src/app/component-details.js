// Assembly anatomy uses the same visible evidence rows as its parent card.
import { chip } from '../evidence.js';

export function renderComponentDetails(host, components = [], { sceneId, partId }) {
  host.replaceChildren(); host.hidden = !components.length;
  if (!components.length) return;
  const heading = document.createElement('h4'); heading.className = 'eyebrow'; heading.textContent = 'Inside this assembly'; host.append(heading);
  for (const component of components) {
    const article = document.createElement('details'); article.className = 'component-detail'; article.dataset.component = component.id;
    const summary = document.createElement('summary');
    const title = document.createElement('span'); title.className = 'component-title'; title.textContent = component.title; summary.append(title);
    if (component.role) { const role = document.createElement('span'); role.className = 'component-role'; role.textContent = component.role; summary.append(role); }
    article.append(summary);
    if (component.body) { const body = document.createElement('p'); body.textContent = component.body; article.append(body); }
    if (component.specs?.length) {
      const specs = document.createElement('dl'); specs.className = 'specs';
      component.specs.forEach((row, index) => {
        const entry = document.createElement('div'), label = document.createElement('dt'), value = document.createElement('dd');
        label.textContent = row[0]; value.textContent = row[1]; entry.append(label, value);
        entry.insertAdjacentHTML('beforeend', chip(row[2], `component:${sceneId}:${partId}:${component.id}:${index}`)); specs.append(entry);
      });
      article.append(specs);
    }
    host.append(article);
  }
}
