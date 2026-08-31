<script lang="ts">
  import "$lib/components/Modal/modal.css";
  import Icon from "$lib/components/Icons/Icon.svelte";
  import Label from "$lib/components/UI/Label.svelte";
  import Select from "$lib/components/UI/Select.svelte";
  import type { IntervalEarConfig } from "./intervalEarTrainingHelpers";
  import Button from "$lib/components/UI/Button.svelte";
  import Input from "$lib/components/UI/Input.svelte";

  type ConfigProps = {
    configData: IntervalEarConfig;
    onComplete: () => void;
  };

  let { configData = $bindable(), onComplete }: ConfigProps = $props();

  let currentQuestionsInputValue = $derived(configData.questionsAmount);

  function handleTypeClick(type: "melodic" | "harmonic") {
    if (configData.selectedTypes.includes(type)) {
      configData.selectedTypes = configData.selectedTypes.filter(
        (e) => e !== type,
      );
    } else {
      configData.selectedTypes = [...configData.selectedTypes, type];
    }
  }

  function handleDirectionClick(direction: "descending" | "ascending") {
    if (configData.selectedDirections.includes(direction)) {
      configData.selectedDirections = configData.selectedDirections.filter(
        (e) => e !== direction,
      );
    } else {
      configData.selectedDirections = [
        ...configData.selectedDirections,
        direction,
      ];
    }
  }

  function handleModalDone() {
    if (configData.selectedTypes.length < 1)
      configData.selectedTypes.push("melodic");

    if (configData.selectedDirections.length < 1)
      configData.selectedDirections.push("ascending");

    if (
      !currentQuestionsInputValue ||
      currentQuestionsInputValue < 0 ||
      currentQuestionsInputValue > 99
    ) {
      currentQuestionsInputValue = 10;
    }
    configData.questionsAmount = currentQuestionsInputValue;

    onComplete();
  }
</script>

<div class="modal-card">
  <div class="modal-header">
    <h2 class="text-heading-3">Configure</h2>
    <Button variant="text" size="icon-small" onclick={handleModalDone}>
      <Icon icon="close" />
    </Button>
  </div>

  <div class="modal-body">
    <div class="flex-col__input-label">
      <p class="text-caption">Type</p>
      <div class="flex-row">
        <Button
          variant="outlined"
          state={configData.selectedTypes.includes("melodic") ? "on" : "off"}
          onclick={() => handleTypeClick("melodic")}>Melodic</Button
        >
        <Button
          variant="outlined"
          state={configData.selectedTypes.includes("harmonic") ? "on" : "off"}
          onclick={() => handleTypeClick("harmonic")}>Harmonic</Button
        >
      </div>
    </div>
    <div class="flex-col__input-label space-above-base">
      <p class="text-caption">Direction</p>
      <div class="flex-row">
        <Button
          variant="outlined"
          state={configData.selectedDirections.includes("ascending")
            ? "on"
            : "off"}
          onclick={() => handleDirectionClick("ascending")}>Ascending</Button
        >
        <Button
          variant="outlined"
          state={configData.selectedDirections.includes("descending")
            ? "on"
            : "off"}
          onclick={() => handleDirectionClick("descending")}>Descending</Button
        >
      </div>
    </div>
    <p class="space-above-base">Octave Range</p>

    <div class="select-inputs flex-row space-above-sm">
      <div class="flex-col__input-label">
        <Label labelFor="octave-low">Low</Label>
        <Select
          id="octave-low"
          bind:value={configData.octaveRangeLow}
          options={[
            { label: "2", value: 2 },
            { label: "3", value: 3 },
            { label: "4", value: 4 },
            { label: "5", value: 5 },
          ]}
        />
      </div>
      <div class="flex-col__input-label">
        <Label labelFor="octave-high">High</Label>
        <Select
          id="octave-high"
          bind:value={configData.octaveRangeHigh}
          options={[
            { label: "3", value: 3 },
            { label: "4", value: 4 },
            { label: "5", value: 5 },
          ]}
        />
      </div>
    </div>
    <div class="flex-col__input-label space-above-lg">
      <Label labelFor="questions">Questions</Label>
      <Input
        id="questions"
        type="number"
        min="0"
        max="99"
        placeholder="10"
        bind:value={currentQuestionsInputValue}
      />
    </div>
  </div>

  <div class="modal-footer">
    <Button onclick={handleModalDone}>Confirm</Button>
  </div>
</div>

<style>
  .select-inputs > div {
    flex: 1;
  }
</style>
