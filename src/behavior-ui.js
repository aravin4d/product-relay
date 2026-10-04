import * as D from './domain.js';

export function ruleSummary(rule, esc) {
  return `<dl class="rule-details"><div><dt>Actor</dt><dd>${esc(rule.actor)}</dd></div><div><dt>When</dt><dd>${esc(rule.condition)}</dd></div><div><dt>Then</dt><dd>${esc(rule.outcome)}</dd></div><div><dt>Applies to</dt><dd>${esc(rule.applicability)}</dd></div><div><dt>Decision owner</dt><dd>${esc(rule.owner)}</dd></div></dl>`;
}

export function renderRules(p, context) {
  const {role, version, showArchived, esc, badge, button, options, header, icon, date} = context;
  const baseline = p.versions.find(v => v.id === version);
  const relevant = rule => role === 'Everyone' || rule.audiences.includes('Everyone') || rule.audiences.includes(role);
  const list = (baseline?.behaviors ?? (baseline ? [] : p.behaviors ?? []))
    .filter(rule => (baseline || showArchived === !!rule.archived) && relevant(rule));
  const pending = baseline ? [] : (p.behaviorChanges ?? []).filter(c => c.status === 'pending' && (relevant(c.base) || relevant(c.proposed)));
  const cards = list.map(rule => `<article class="panel section-card rule-card">
    <div class="card-meta">${rule.audiences.map(a => badge(a)).join('')}${badge(rule.archived ? 'Archived' : rule.status, rule.archived ? '' : rule.status)}${!baseline && D.isStale(p, rule) ? badge('Evidence changed', 'warning') : ''}<span>Rule revision ${rule.revision}</span></div>
    <h2>${esc(rule.title)}</h2>${ruleSummary(rule, esc)}
    <div class="evidence-links">${rule.evidence.map((e, i) => button(icon('file') + esc(p.sources.find(s => s.id === e.sourceId)?.title ?? 'Source'), 'rule-evidence', `data-id="${rule.id}" data-index="${i}"`, 'evidence-btn')).join('')}
      ${rule.ownerNote ? `<p class="decision"><strong>Review decision</strong> ${esc(rule.ownerNote)}</p>` : ''}
      ${!rule.evidence.length && !rule.ownerNote ? '<p class="warning-text">Source evidence or an explicit owner decision is required for approval.</p>' : ''}
    </div>
    ${baseline ? '' : `<div class="card-actions">${rule.archived ? button('Restore rule', 'restore-rule', `data-id="${rule.id}"`, 'secondary') : (rule.status === 'draft' ? button('Edit draft', 'edit-rule', `data-id="${rule.id}"`, 'secondary') + button('Review & approve', 'approve-rule', `data-id="${rule.id}"`, 'primary') : button('Propose update', 'propose-rule', `data-id="${rule.id}"`, 'secondary')) + button('Archive', 'archive-rule', `data-id="${rule.id}"`, 'quiet')}${button('Decision history', 'rule-history', `data-id="${rule.id}"`, 'text-button')}</div>`}
  </article>`).join('');
  return header('AGREED PRODUCT BEHAVIOR', 'Product rules', baseline ? `Preserved baseline v${baseline.number} · ${baseline.label}` : 'Describe the actor, condition, outcome, and release scope once. Every team reads the same agreement.', baseline ? '' : button(icon('plus') + ' Add product rule', 'new-rule', '', 'primary')) +
    `<div class="toolbar"><label>Baseline<select id="version-picker">${options([['', 'Working product'], ...p.versions.map(v => [v.id, `v${v.number} · ${v.label}`])], version)}</select></label>${baseline ? badge('Historical agreement', 'blue') : button(showArchived ? 'Show active' : 'Show archive', 'toggle-archive', '', 'text-button')}</div>` +
    `<div class="section-grid">${cards || '<div class="empty panel"><h2>Keep rules and exceptions clear</h2><p>Add the behavior, its conditions, and supporting evidence. Product rules are shared across team perspectives.</p></div>'}</div>` +
    (pending.length ? `<section class="rule-review"><div class="section-heading"><h2>Proposed rule updates</h2>${badge(`${pending.length} awaiting review`, 'warning')}</div>${pending.map(c => {
      const blocker = D.behaviorProposalBlocker(p, c);
      return `<article class="panel change-card"><h3>${esc(c.base.title)}</h3><p class="muted">${esc(c.reason)} · ${date(c.at)}</p><div class="diff"><section><span>CURRENT AGREEMENT</span>${ruleSummary(c.base, esc)}</section><section><span>PROPOSED AGREEMENT</span><h3>${esc(c.proposed.title)}</h3>${ruleSummary(c.proposed, esc)}</section></div>${c.proposed.evidence.map(e => `<blockquote>${esc(e.quote)}</blockquote>`).join('')}${blocker ? `<p class="warning-banner">${esc(blocker)}</p>` : ''}<div class="card-actions">${button('Review & accept', 'accept-rule', `data-id="${c.id}" ${blocker ? 'disabled' : ''}`, 'primary')}${button('Reject', 'reject-rule', `data-id="${c.id}"`, 'secondary')}</div></article>`;
    }).join('')}</section>` : '');
}

export function ruleFields(rule, helpers) {
  const {field, esc, options, project} = helpers;
  return field('Rule title', 'title', rule?.title ?? '') +
    field('Who performs this behavior?', 'actor', rule?.actor ?? '', 'text', 'For example: workspace owner, customer, or billing service.') +
    field('When does this rule apply?', 'condition', rule?.condition ?? '', 'textarea', 'Keep qualifying conditions explicit, such as fraud-confirmed accounts only.') +
    field('What happens?', 'outcome', rule?.outcome ?? '', 'textarea') +
    field('Release, environment, and scope', 'applicability', rule?.applicability ?? '', 'textarea', 'For example: Release 2 onward · confirmed fraud · production.') +
    field('Decision owner', 'owner', rule?.owner ?? '') +
    `<fieldset class="audience-field"><legend>Teams that need this rule</legend>${(project?D.activeRoles(project):D.ROLES).map(a => `<label class="checkbox-label"><input type="checkbox" name="audiences" value="${esc(a)}" ${(rule?.audiences ?? ['Everyone']).includes(a) ? 'checked' : ''}>${esc(a)}</label>`).join('')}<small>These are perspective filters. Everyone with the project file can read all its content.</small></fieldset>`;
}

export function ruleDetailsFromForm(form, rule = null) {
  const details = Object.fromEntries(['title', 'actor', 'condition', 'outcome', 'applicability', 'owner'].map(key => [key, form.get(key)]));
  details.audiences = form.getAll('audiences');
  const sourceId = form.get('sourceId');
  if (sourceId === '__none') details.evidence = [];
  else if (sourceId) { details.sourceId = sourceId; details.quote = form.get('quote'); }
  else details.evidence = rule?.evidence ?? [];
  return details;
}
