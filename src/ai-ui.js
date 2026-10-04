import {ruleSummary} from './behavior-ui.js';

export function candidateRule(candidate, owner = '') {
  const exclusions = Array.isArray(candidate.exclusions) ? candidate.exclusions.join('; ') : candidate.exclusions;
  return {
    title: candidate.title,
    actor: candidate.actor,
    condition: candidate.condition,
    outcome: candidate.outcome,
    applicability: candidate.scope + (exclusions ? `\nLimits / exclusions: ${exclusions}` : ''),
    owner,
    audiences: candidate.roles,
    evidence: candidate.evidence
  };
}

export function resultIsStale(project, result) {
  return result.projectId !== project.id || result.sources.some(ref => {
    const source = project.sources.find(s => s.id === ref.sourceId);
    return !source || source.archived || source.revisions.at(-1).id !== ref.revisionId;
  });
}

export function renderAIWorkspace(p, state, helpers) {
  const {header, esc, badge, button, icon, date} = helpers;
  const current = state.result?.projectId === p.id ? state.result : null;
  const stale = current && resultIsStale(p, current);
  const active = p.sources.filter(s => !s.archived);
  const result = current?.output;
  return header('OPTIONAL AI ASSISTANCE', 'From sources to a reviewable draft', 'Choose the original material, inspect the suggestions, and make the decisions yourself.', button('Connection settings', 'ai-config', '', 'secondary')) +
    `<div class="ai-grid"><section class="panel"><h2>Connection</h2>${state.config ? `<p class="muted">Gateway: ${esc(state.config.supabaseUrl)}</p>` : '<p class="muted">Connect an optional private AI gateway to generate suggestions. Manual product rules and handbooks work without this connection.</p>'}
    <div class="card-actions">${state.session ? badge('Signed in for this tab', 'approved') + button('Sign out of AI', 'ai-signout', '', 'secondary') : button('Sign in to AI', 'ai-signin', state.config ? '' : 'disabled', 'primary')}</div>
    <p class="small-note">Your provider key belongs in backend secrets. Connection settings contain only a public project URL and publishable key. Your sign-in token stays in this tab.</p></section>
    <section class="panel"><h2>What gets shared</h2><p class="muted">Only the sources you select below are sent to your gateway and its configured AI provider. They are sent as readable text. Your project passphrase and encryption key are never sent.</p><p class="small-note">Review your provider’s data policy before connecting real product material. AI output stays unapproved until you review it.</p></section></div>
    <form id="ai-generation-form" class="panel ai-selection"><h2>Generate product rule drafts</h2><p class="muted">Select up to 8 current source passages, with at most 24,000 characters per source and 48,000 combined. For a longer document, paste an exact passage below.</p>${active.map(s => `<label class="checkbox-label"><input type="checkbox" name="sources" value="${esc(s.id)}" ${state.selectedIds?.includes(s.id)?'checked':''} ${state.busy ? 'disabled' : ''}><span>${esc(s.title)} <small>Revision ${s.revisions.length} · ${s.revisions.at(-1).content.length.toLocaleString()} characters</small></span></label><details class="ai-excerpt"><summary>Choose a passage from this source${s.revisions.at(-1).content.length>24000?' · required for this document':' · optional'}</summary><p class="small-note">Leave blank to use the complete source when it fits. Paste an exact passage, up to 24,000 characters.</p>${button('Read original source','read-source',`data-id="${s.id}"`,'text-button')}<label>Selected passage from ${esc(s.title)}<textarea name="excerpt-${s.id}" maxlength="24000" ${state.busy?'disabled':''}>${esc(state.excerpts?.[s.id]??'')}</textarea></label></details>`).join('') || '<p class="small-note">Add a source in the source library first.</p>'}<label class="checkbox-label"><input type="checkbox" name="consent" required ${state.consent?'checked':''} ${state.busy ? 'disabled' : ''}><span>I agree to send these selected source passages to the configured AI provider.</span></label><div class="card-actions"><button type="submit" class="primary" ${!state.session || state.busy || !active.length ? 'disabled' : ''}>${state.busy ? 'Generating drafts…' : 'Generate drafts'}</button>${state.busy ? button('Cancel request', 'ai-cancel', '', 'secondary') : ''}</div><p id="ai-request-status" class="ai-status" role="status">${esc(state.status ?? '')}</p></form>` +
    (current ? `<section class="ai-review-list"><div class="section-heading"><h2>Review suggestions</h2>${badge(stale ? 'Source context changed' : 'Unapproved AI suggestions', 'warning')}</div><p class="muted">${esc(result.metadata.model)} · ${date(result.metadata.at)}. Drafts are not proof of implementation or testing.</p>${stale ? '<div class="warning-banner">A selected source changed or was archived after generation. Regenerate before accepting these suggestions.</div>' : ''}${result.warnings.map(w => `<p class="warning-banner">${esc(w)}</p>`).join('')}${result.behaviors.map((candidate, i) => `<article class="panel ai-candidate"><h2>${esc(candidate.title)}</h2>${ruleSummary(candidateRule(candidate), esc)}${candidate.evidence.map(e => `<blockquote>${esc(e.quote)}</blockquote><p class="source-location">${esc(p.sources.find(s => s.id === e.sourceId)?.title)} · original source revision</p>`).join('')}<div class="card-actions">${current.behaviorStates[i] ? badge(current.behaviorStates[i], current.behaviorStates[i] === 'Draft saved' ? 'approved' : '') : button('Edit & save as draft', 'ai-save-rule', `data-index="${i}" ${stale ? 'disabled' : ''}`, 'primary') + button('Compare with agreed rule', 'ai-compare-rule', `data-index="${i}" ${stale ? 'disabled' : ''}`, 'secondary') + button('Discard suggestion', 'ai-discard-rule', `data-index="${i}"`, 'secondary')}</div></article>`).join('')}${(result.sections??[]).map((section,i)=>`<article class="panel ai-candidate"><div class="card-meta">${badge('Handbook draft','blue')}${badge(section.role)}</div><h2>${esc(section.title)}</h2><p class="prose">${esc(section.body)}</p>${section.evidence.map(e=>`<blockquote>${esc(e.quote)}</blockquote>`).join('')}<div class="card-actions">${current.sectionStates?.[i]?badge(current.sectionStates[i]):button('Review & save handbook draft','ai-save-section',`data-index="${i}" ${stale?'disabled':''}`,'primary')+button('Discard','ai-discard-section',`data-index="${i}"`,'secondary')}</div></article>`).join('')}${result.questions.map((q, i) => `<article class="panel ai-candidate"><div class="card-meta">${badge(q.role)}${badge('Unresolved question', 'warning')}</div><h2>${esc(q.title)}</h2><p class="prose">${esc(q.reason)}</p>${q.evidence.map(e => `<blockquote>${esc(e.quote)}</blockquote>`).join('')}<div class="card-actions">${current.questionStates[i] ? badge(current.questionStates[i]) : button('Save question', 'ai-save-question', `data-index="${i}" ${stale ? 'disabled' : ''}`, 'secondary') + button('Discard', 'ai-discard-question', `data-index="${i}"`, 'quiet')}</div></article>`).join('')}${!result.behaviors.length && !result.questions.length && !result.sections?.length ? '<div class="empty panel"><h2>No supported suggestions</h2><p>Try a clearer source. Add unresolved information manually as a question.</p></div>' : ''}</section>` : '');
}
