export function getWalkTips({
  distanceMeters,
  durationMs,
  calories,
  weightKg,
  ageYears,
  dogName,
  breed,
}) {
  const tips = [];
  const km = distanceMeters / 1000;
  const minutes = durationMs / (1000 * 60);
  const weight = Number(weightKg) || 5;
  const age = Number(ageYears) || 2;
  const name = dogName || 'кучето';
  const breedLabel = breed ? ` (${breed})` : '';

  if (km < 0.3) {
    tips.push('Кратка разходка — следващия път опитайте още малко обиколка около квартала.');
  } else if (km < 1.5) {
    tips.push(`Хубаво начало! За ${name} около 1–2 км често е чудесна ежедневна доза.`);
  } else if (km < 4) {
    tips.push(`Супер разстояние! ${name}${breedLabel} със сигурност е бил/а щастлив/а навън.`);
  } else {
    tips.push('Дълга разходка! Уверете се, че има достатъчно вода и почивки.');
  }

  if (minutes >= 45) {
    tips.push(`След по-дълга разходка дайте на ${name} спокойно време да си отдъхне вкъщи.`);
  } else if (minutes < 10 && km > 0.2) {
    tips.push('Кратко, но енергично! Добре е да редувате кратки и по-дълги разходки.');
  }

  if (calories > weight * 2) {
    tips.push('Изгорените калории са солидни — малко лакомство след игра е заслужено.');
  } else if (calories > 0) {
    tips.push(
      `Калориите са приблизителни. Ако ${name} е много енергичен/а, добавете и малко игра с топка.`
    );
  }

  if (age < 1) {
    tips.push('Кученцата растат бързо — по-късите, по-чести разходки са по-щадящи за ставите.');
  } else if (age >= 8) {
    tips.push('При по-възрастни кучета следете темпото и избягвайте хлъзгав или много горещ терен.');
  }

  if (weight < 10) {
    tips.push('Малките кучета се уморяват и прегряват по-бързо — предлагайте вода и сенка.');
  } else if (weight > 30) {
    tips.push('По-големите кучета обичат пространството — паркове и по-дълги маршрути са идеални.');
  }

  tips.push('След разходка проверете лапите за камъчета, стъкла или горещ асфалт.');
  tips.push(`Редовните разходки намаляват стреса и укрепват връзката ви с ${name}.`);

  return tips.slice(0, 4);
}
