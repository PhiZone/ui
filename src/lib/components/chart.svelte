<script lang="ts">
    import { Size } from '$lib/constants';
    import { t } from '$lib/translations/config';
    import type { Chart } from '$lib/models';

    export let chart: Chart;
</script>

    <div class="card w-96 bg-base-100 shadow-xl">
        <div class="card-body">
            <h2 class="card-title">{chart.level}</h2>
            <p>{chart.difficulty}</p>
        </div>
    </div>
