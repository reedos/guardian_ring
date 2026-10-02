// Assembly anatomy uses the same visible evidence rows as its parent card.
import { chip } from '../evidence.js';

export function renderComponentDetails(host, components = [], { sceneId, partId }) {
  host.replaceChildren(); host.hidden = !components.length;
  if (!components.length) return;
  const heading = document.createElement('h4'); heading.className = 'eyebrow'; heading.textContent = 'Inside this assembly'; host.append(heading);
  for (const component of components) {
    const article = document.createElement('article'); article.className = 'component-detail'; article.dataset.component = component.id;
    const title = document.createElement('h5'); title.textContent = component.title; article.append(title);
    if (component.role) { const role = document.createElement('p'); role.className = 'component-role'; role.textContent = component.role; article.append(role); }
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
